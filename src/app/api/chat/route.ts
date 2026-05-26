import { streamText, convertToModelMessages, stepCountIs, type UIMessage } from "ai";
import { gateway } from "@ai-sdk/gateway";
import { z } from "zod";
import { buildSystemPrompt } from "@/lib/chat/prompt";
import {
  getOrCreateSession,
  saveMessage,
  escalateSession,
} from "@/lib/chat/session";
import { helyosTools } from "@/lib/chat/helyos-tools";

export const maxDuration = 60;

const updateChatStateTool = {
  description:
    "REQUIRED: Call this with every single response to update the chat UI. Provide quick-reply suggestions, urgency, and escalation info.",
  inputSchema: z.object({
    suggestions: z
      .array(z.string())
      .max(4)
      .describe("2–4 short quick-reply labels in patient's language"),
    urgency: z
      .enum(["browsing", "interested", "ready_to_book"])
      .describe("Patient booking urgency"),
    shouldEscalate: z.boolean().describe("Offer operator escalation now"),
    escalationTarget: z
      .enum(["genevity", "helyos"])
      .describe("Which clinic operator to connect"),
    escalationHint: z.string().nullable().describe("Reason for escalation or null"),
    collectedName: z.string().nullable().describe("Patient name if mentioned naturally"),
    collectedPhone: z.string().nullable().describe("Patient phone if mentioned naturally"),
  }),
  // No execute — this is a client-side tool handled by onToolCall in useChat
};

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
    model: gateway("openai/gpt-4o-mini"),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: {
      ...helyosTools,
      updateChatState: updateChatStateTool,
    },
    onFinish: async ({ text, steps }) => {
      if (text) {
        await saveMessage({ sessionId: session.id, role: "assistant", content: text });
      }

      // Find updateChatState call across all steps
      const stateCall = steps
        .flatMap((s) => s.toolCalls ?? [])
        .find((c) => c.toolName === "updateChatState");

      if (stateCall?.input) {
        const args = stateCall.input as {
          shouldEscalate: boolean;
          escalationTarget: "genevity" | "helyos";
          escalationHint: string | null;
          collectedName: string | null;
          collectedPhone: string | null;
        };
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
