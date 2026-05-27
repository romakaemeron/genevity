import { streamText, convertToModelMessages, stepCountIs, type UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { buildSystemPrompt } from "@/lib/chat/prompt";
import {
  getOrCreateSession,
  saveMessage,
  escalateSession,
  updateSessionState,
} from "@/lib/chat/session";

export const maxDuration = 60;

const updateChatStateTool = {
  description:
    "Call this AFTER writing your text reply to update the chat UI state. Always generate text first, then call this tool.",
  inputSchema: z.object({
    suggestions: z
      .array(z.string())
      .max(4)
      .describe("2–4 short quick-reply labels in patient's language"),
    urgency: z
      .enum(["browsing", "interested", "ready_to_book"])
      .describe("Patient booking urgency"),
    topics: z
      .array(z.string())
      .describe("Topics the patient has asked about so far, e.g. ['ботокс', 'ціни']"),
    shouldEscalate: z.boolean().describe("Offer operator escalation now"),
    escalationTarget: z
      .enum(["genevity", "helyos"])
      .describe("Which clinic operator to connect"),
    escalationHint: z.string().nullable().describe("Reason for escalation or null"),
    collectedName: z.string().nullable().describe("Patient name if mentioned naturally"),
    collectedPhone: z.string().nullable().describe("Patient phone if mentioned naturally"),
  }),
  // No execute — client-side tool handled by onToolCall in useChat
};

const URGENCY_LABEL: Record<string, string> = {
  browsing: "Переглядає",
  interested: "Зацікавлений",
  ready_to_book: "Готовий до запису",
};

function buildOperatorNote(args: {
  urgency: string;
  topics: string[];
  escalationHint: string | null;
  collectedName: string | null;
  collectedPhone: string | null;
  pageTitle?: string;
  locale: string;
}): string {
  const lines: string[] = ["=== GENEVITY AI-чат — брифінг для оператора ==="];
  lines.push(`Статус: ${URGENCY_LABEL[args.urgency] ?? args.urgency}`);
  if (args.collectedName) lines.push(`Ім'я: ${args.collectedName}`);
  if (args.collectedPhone) lines.push(`Телефон: ${args.collectedPhone}`);
  if (args.topics.length) lines.push(`Питання: ${args.topics.join(", ")}`);
  if (args.escalationHint) lines.push(`Контекст: ${args.escalationHint}`);
  if (args.pageTitle) lines.push(`Сторінка: ${args.pageTitle}`);
  lines.push(`Мова: ${args.locale.toUpperCase()}`);
  return lines.join("\n");
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    messages: UIMessage[];
    sessionToken: string;
    locale?: string;
    pageUrl?: string;
    pageTitle?: string;
  };

  const { messages, sessionToken, locale = "uk", pageUrl, pageTitle } = body;

  if (!sessionToken || !messages?.length) {
    return new Response("Bad request", { status: 400 });
  }

  const session = await getOrCreateSession({ sessionToken, locale, pageUrl, pageTitle });

  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
  if (lastUserMsg) {
    const text = lastUserMsg.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("");
    if (text && !text.startsWith("__")) {
      await saveMessage({ sessionId: session.id, role: "user", content: text });
    }
  }

  const systemPrompt = buildSystemPrompt({ locale, pageUrl, pageTitle });

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: {
      updateChatState: updateChatStateTool,
    },
    onFinish: async ({ text, steps }) => {
      if (text) {
        await saveMessage({ sessionId: session.id, role: "assistant", content: text });
      }

      const stateCall = steps
        .flatMap((s) => s.toolCalls ?? [])
        .find((c) => c.toolName === "updateChatState");

      if (stateCall?.input) {
        const args = stateCall.input as {
          urgency: string;
          topics: string[];
          shouldEscalate: boolean;
          escalationTarget: "genevity" | "helyos";
          escalationHint: string | null;
          collectedName: string | null;
          collectedPhone: string | null;
        };

        const operatorNote = buildOperatorNote({
          urgency: args.urgency,
          topics: args.topics ?? [],
          escalationHint: args.escalationHint,
          collectedName: args.collectedName,
          collectedPhone: args.collectedPhone,
          pageTitle,
          locale,
        });

        await updateSessionState({
          sessionId: session.id,
          urgency: args.urgency,
          topics: args.topics ?? [],
          operatorNote,
          patientName: args.collectedName,
          patientPhone: args.collectedPhone,
        });

        if (args.shouldEscalate) {
          await escalateSession({
            sessionId: session.id,
            escalationBy: "bot",
            escalationTarget: args.escalationTarget,
            summary: args.escalationHint ?? "Пацієнт готовий до запису",
            patientName: args.collectedName,
            patientPhone: args.collectedPhone,
          });
        }
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
