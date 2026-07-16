# Свiтлана AI Chat Widget — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a proactive AI chat widget (codename Свiтлана) that advises patients about Genevity and Helyos clinic services, tracks conversation urgency, and hands off to a live Binotel operator with a pre-filled summary.

**Architecture:** Floating React widget (`ChatWidget`) calls `POST /api/chat` which runs `streamText` (AI SDK v6, GPT-4o-mini via AI Gateway) with an `updateChatState` client-side tool for metadata and three Helyos DB tools for on-demand cross-referral. Sessions and messages are persisted in Neon. On escalation, `window.binotelChatWidget.open()` is called with a pre-filled summary.

**Tech Stack:** `ai@6`, `@ai-sdk/gateway`, `@ai-sdk/react`, `zod`, Neon (two DB clients), Framer Motion (already installed), Tailwind CSS v4.

---

## File Map

```
NEW:
src/lib/db/helyos.ts                    Helyos Neon SQL client
src/lib/chat/session.ts                 DB helpers: create/get session, save message, escalate
src/lib/chat/prompt.ts                  Builds system prompt from agent.md + context
src/lib/chat/helyos-tools.ts            AI SDK tool definitions for Helyos DB queries
src/lib/chat/agent.md                   Genevity knowledge base (human-editable)
src/app/api/chat/route.ts               POST streaming handler
src/components/chat/useChatSession.ts   Session token from sessionStorage
src/components/chat/ChatMessage.tsx     Single message bubble
src/components/chat/ChatPanel.tsx       Message list + input + quick-reply chips
src/components/chat/ChatEscalation.tsx  Escalation screen (Genevity / Helyos)
src/components/chat/ChatWidget.tsx      Floating button + panel orchestrator
src/app/(admin)/admin/chats/page.tsx            Admin chat sessions list
src/app/(admin)/admin/chats/[id]/page.tsx       Admin chat session detail

MODIFIED:
src/app/layout.tsx                                     Add <ChatWidget />
src/app/(admin)/admin/_components/admin-sidebar.tsx   Add "Чати" nav link
```

---

## Task 1: Install dependencies

**Files:** `package.json` (via npm)

- [ ] **Step 1: Install packages**

```bash
npm install @ai-sdk/react zod
```

(`ai` and `@ai-sdk/gateway` and `@ai-sdk/openai` are already installed from earlier)

- [ ] **Step 2: Verify**

```bash
node -e "require('@ai-sdk/react'); require('zod'); console.log('ok')"
```

Expected: `ok`

- [ ] **Step 3: Add env vars to `.env.local`**

Append to `.env.local`:

```bash
# Свiтлана AI Chat Widget
HELYOS_DATABASE_URL=postgres://...helyos-neon-connection-string...
```

Note: `OPENAI_API_KEY` is used by the AI Gateway automatically when set. Add it if not already present.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat(chat): install @ai-sdk/react + zod"
```

---

## Task 2: Database migration

**Files:**
- Create: `src/lib/db/migrations/010_chat_sessions.sql`

- [ ] **Step 1: Create migration file**

Create `src/lib/db/migrations/010_chat_sessions.sql`:

```sql
CREATE TABLE IF NOT EXISTS chat_sessions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token     text UNIQUE NOT NULL,
  locale            text NOT NULL DEFAULT 'uk',
  started_at        timestamptz NOT NULL DEFAULT now(),
  escalated_at      timestamptz,
  escalation_by     text,
  escalation_target text,
  summary           text,
  patient_name      text,
  patient_phone     text,
  patient_interest  text,
  page_url          text,
  page_title        text
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role        text NOT NULL,
  content     text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS chat_messages_session_id_created_at
  ON chat_messages(session_id, created_at);
```

- [ ] **Step 2: Run migration**

```bash
npx dotenv -e .env.local -- npx tsx -e "
import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
const sql = neon(process.env.DATABASE_URL);
const ddl = readFileSync('src/lib/db/migrations/010_chat_sessions.sql', 'utf8');
await sql.unsafe(ddl);
console.log('done');
"
```

Expected: `done`

- [ ] **Step 3: Verify tables**

```bash
npx dotenv -e .env.local -- npx tsx -e "
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);
const rows = await sql\`SELECT table_name FROM information_schema.tables WHERE table_name IN ('chat_sessions','chat_messages') ORDER BY table_name\`;
console.log(rows.map(r => r.table_name));
"
```

Expected: `[ 'chat_messages', 'chat_sessions' ]`

- [ ] **Step 4: Commit**

```bash
git add src/lib/db/migrations/010_chat_sessions.sql
git commit -m "feat(chat): add chat_sessions + chat_messages migration"
```

---

## Task 3: Helyos DB client

**Files:**
- Create: `src/lib/db/helyos.ts`

- [ ] **Step 1: Create client**

Create `src/lib/db/helyos.ts`:

```ts
import { neon } from "@neondatabase/serverless";

export const helyosSql = neon(process.env.HELYOS_DATABASE_URL!);
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/db/helyos.ts
git commit -m "feat(chat): Helyos Neon DB client"
```

---

## Task 4: Chat session DB helpers

**Files:**
- Create: `src/lib/chat/session.ts`

- [ ] **Step 1: Create helpers**

Create `src/lib/chat/session.ts`:

```ts
import { sql } from "@/lib/db/client";

export interface ChatSession {
  id: string;
  session_token: string;
  locale: string;
}

export async function getOrCreateSession(params: {
  sessionToken: string;
  locale: string;
  pageUrl?: string;
  pageTitle?: string;
}): Promise<ChatSession> {
  const existing = await sql`
    SELECT id, session_token, locale
    FROM chat_sessions
    WHERE session_token = ${params.sessionToken}
    LIMIT 1
  `;
  if (existing[0]) return existing[0] as ChatSession;

  const created = await sql`
    INSERT INTO chat_sessions (session_token, locale, page_url, page_title)
    VALUES (${params.sessionToken}, ${params.locale},
            ${params.pageUrl ?? null}, ${params.pageTitle ?? null})
    RETURNING id, session_token, locale
  `;
  return created[0] as ChatSession;
}

export async function saveMessage(params: {
  sessionId: string;
  role: "user" | "assistant";
  content: string;
}): Promise<void> {
  await sql`
    INSERT INTO chat_messages (session_id, role, content)
    VALUES (${params.sessionId}, ${params.role}, ${params.content})
  `;
}

export async function escalateSession(params: {
  sessionId: string;
  escalationBy: "bot" | "user";
  escalationTarget: "genevity" | "helyos";
  summary: string;
  patientName?: string | null;
  patientPhone?: string | null;
  patientInterest?: string | null;
}): Promise<void> {
  await sql`
    UPDATE chat_sessions SET
      escalated_at      = now(),
      escalation_by     = ${params.escalationBy},
      escalation_target = ${params.escalationTarget},
      summary           = ${params.summary},
      patient_name      = ${params.patientName ?? null},
      patient_phone     = ${params.patientPhone ?? null},
      patient_interest  = ${params.patientInterest ?? null}
    WHERE id = ${params.sessionId}
  `;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/chat/session.ts
git commit -m "feat(chat): session DB helpers"
```

---

## Task 5: Genevity knowledge base (agent.md)

**Files:**
- Create: `src/lib/chat/agent.md`

- [ ] **Step 1: Query real services from DB to populate the file**

```bash
npx dotenv -e .env.local -- npx tsx -e "
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);
const rows = await sql\`
  SELECT s.title_uk, s.price_from_uk, c.title_uk AS cat
  FROM services s JOIN service_categories c ON s.category_id = c.id
  ORDER BY c.sort_order, s.sort_order
\`;
rows.forEach(r => console.log(r.cat, '|', r.title_uk, '|', r.price_from_uk));
"
```

- [ ] **Step 2: Query real doctors**

```bash
npx dotenv -e .env.local -- npx tsx -e "
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);
const rows = await sql\`SELECT name_uk, role_uk FROM doctors WHERE is_published = true ORDER BY sort_order\`;
rows.forEach(r => console.log(r.name_uk, '|', r.role_uk));
"
```

- [ ] **Step 3: Create agent.md using real data from steps 1 and 2**

Create `src/lib/chat/agent.md` — fill in `[...]` with actual values from the DB queries above:

```markdown
# GENEVITY — База знань асистента

## Про клініку
**Назва:** Медичний центр естетичної медицини та довголіття GENEVITY
**Адреса:** [адреса з адмін-панелі]
**Телефон:** 056 794 70 00
**Графік роботи:** [графік]
**Спеціалізація:** Естетична медицина, антивікова медицина, програми довголіття

## Філософія
[Текст про клініку та підхід]

## Послуги

### [Категорія 1 з БД]
- **[Послуга]** — [опис]. Від [ціна] грн.

### [Категорія 2 з БД]
- **[Послуга]** — [опис]. Від [ціна] грн.

## Лікарі

### [Ім'я лікаря з БД]
Спеціалізація: [роль]

## FAQ

**Чи боляче?**
Більшість процедур проводяться з анестезією. Дискомфорт мінімальний.

**Як довго тримається ефект ботулінотерапії?**
Зазвичай 4–6 місяців.

**Чи є протипоказання?**
Так — вагітність, лактація, гострі запалення. Деталі уточнюються на консультації.

**Як записатися?**
Запис через адміністратора — я з'єдную вас.

## Що НЕ робимо
Хірургія, кардіологія, онкологія, ЕКО, педіатрія → партнерська клініка Helyos.

## Інструкції для Джидяри
- Ніколи не записуй пацієнта сам — запропонуй з'єднати з адміністратором.
- Після кожної відповіді обов'язково викликай інструмент updateChatState.
- Будь проактивним: пропонуй 2–4 логічних chip-підказки.
- Cross-sell: ботулінотерапія + біоревіталізація, IV + нутриціологія, PRP + мезо волосся.
- Urgency ready_to_book: пацієнт каже "хочу записатись", "коли можна прийти", "яка ціна прийому" → одразу shouldEscalate=true.
- Якщо тема поза GENEVITY → спочатку використай helyos tools, потім запропонуй оператора Helyos.
- Мова = мова запиту пацієнта.
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/chat/agent.md
git commit -m "feat(chat): Genevity knowledge base (agent.md)"
```

---

## Task 6: System prompt builder

**Files:**
- Create: `src/lib/chat/prompt.ts`

- [ ] **Step 1: Create prompt builder**

Create `src/lib/chat/prompt.ts`:

```ts
import { readFileSync } from "fs";
import { join } from "path";

const agentMdPath = join(process.cwd(), "src/lib/chat/agent.md");

function loadAgentMd(): string {
  try {
    return readFileSync(agentMdPath, "utf8");
  } catch {
    return "<!-- agent.md not found -->";
  }
}

export function buildSystemPrompt(params: {
  locale: string;
  pageUrl?: string;
  pageTitle?: string;
}): string {
  const knowledge = loadAgentMd();
  const lang =
    params.locale === "ru" ? "Russian" :
    params.locale === "en" ? "English" :
    "Ukrainian";

  return `Ти — Свiтлана, AI-асистент клініки GENEVITY (Дніпро).
Характер: тепла, впевнена, ненав'язлива, професійна.
Відповідай мовою пацієнта. Мова поточної сесії: ${lang}.

--- БАЗА ЗНАНЬ GENEVITY ---
${knowledge}
--- КІНЕЦЬ БАЗИ ЗНАНЬ ---

КОНТЕКСТ:
URL: ${params.pageUrl ?? "невідомо"}
Заголовок: ${params.pageTitle ?? "невідомо"}

ПРАВИЛА:
1. Теми: GENEVITY, естетична медицина, косметологія, довголіття, Helyos (через tools).
2. Поза темами — м'яко перенаправляй.
3. Ніколи не записуй пацієнта — тільки пропонуй з'єднати з оператором.
4. ОБОВ'ЯЗКОВО викликай updateChatState в кожній відповіді.
5. Для Helyos-тем — використовуй tools searchHelyosServices / searchHelyosDoctors / getHelyosServiceDetail.
6. Urgency: browsing (цікавиться) / interested (конкретні питання) / ready_to_book (хоче записатись).
7. Пропонуй оператора: ready_to_book → одразу; interested → через 2–3 обміни; browsing → через 5–6.
8. Пропонуй escalation один раз за сесію, якщо відмовились — знову тільки при ready_to_book.`;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/chat/prompt.ts
git commit -m "feat(chat): system prompt builder"
```

---

## Task 7: Helyos AI tools

**Files:**
- Create: `src/lib/chat/helyos-tools.ts`

- [ ] **Step 1: Create tool definitions (AI SDK v6 syntax)**

Create `src/lib/chat/helyos-tools.ts`:

```ts
import { z } from "zod";
import { helyosSql } from "@/lib/db/helyos";

export const helyosTools = {
  searchHelyosServices: {
    description:
      "Search Helyos clinic services and medical directions by keyword. Use when patient asks about something outside Genevity's profile: surgery, cardiology, oncology, IVF, diagnostics, etc.",
    inputSchema: z.object({
      query: z.string().describe("Search keyword in Ukrainian or Russian"),
    }),
    execute: async ({ query }: { query: string }) => {
      try {
        const rows = await helyosSql`
          SELECT id, title_uk AS title, description_uk AS description,
                 price_from_uk AS price_from
          FROM services
          WHERE title_uk ILIKE ${"%" + query + "%"}
             OR description_uk ILIKE ${"%" + query + "%"}
          LIMIT 5
        `;
        if (!rows.length) return { results: [], note: "Нічого не знайдено: " + query };
        return { results: rows };
      } catch {
        return { results: [], note: "Помилка пошуку в Helyos" };
      }
    },
  },

  searchHelyosDoctors: {
    description:
      "Find Helyos doctors by specialty. Use when patient asks about a specific medical specialty at Helyos.",
    inputSchema: z.object({
      specialty: z.string().describe("Specialty in Ukrainian/Russian, e.g. кардіолог, хірург"),
    }),
    execute: async ({ specialty }: { specialty: string }) => {
      try {
        const rows = await helyosSql`
          SELECT name_uk AS name, role_uk AS role
          FROM doctors
          WHERE role_uk ILIKE ${"%" + specialty + "%"}
             OR name_uk  ILIKE ${"%" + specialty + "%"}
          LIMIT 5
        `;
        if (!rows.length) return { doctors: [], note: "Лікарів не знайдено" };
        return { doctors: rows };
      } catch {
        return { doctors: [], note: "Помилка пошуку лікарів Helyos" };
      }
    },
  },

  getHelyosServiceDetail: {
    description:
      "Get full details of a specific Helyos service by its ID. Use after searchHelyosServices when the patient wants more detail.",
    inputSchema: z.object({
      serviceId: z.string().describe("Service ID from searchHelyosServices result"),
    }),
    execute: async ({ serviceId }: { serviceId: string }) => {
      try {
        const rows = await helyosSql`
          SELECT s.id, s.title_uk AS title, s.description_uk AS description,
                 s.price_from_uk AS price_from, c.title_uk AS category
          FROM services s
          LEFT JOIN service_categories c ON s.category_id = c.id
          WHERE s.id = ${serviceId}
          LIMIT 1
        `;
        if (!rows[0]) return { service: null, note: "Послугу не знайдено" };
        return { service: rows[0] };
      } catch {
        return { service: null, note: "Помилка отримання деталей Helyos" };
      }
    },
  },
} as const;
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/chat/helyos-tools.ts
git commit -m "feat(chat): Helyos on-demand AI tools (v6 syntax)"
```

---

## Task 8: Chat API route

**Files:**
- Create: `src/app/api/chat/route.ts`

- [ ] **Step 1: Create the route (AI SDK v6)**

Create `src/app/api/chat/route.ts`:

```ts
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
  const body = await req.json() as {
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
```

- [ ] **Step 2: Start dev server and smoke-test**

```bash
npm run dev
```

In another terminal:

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages":[{"id":"1","role":"user","content":"test","parts":[{"type":"text","text":"Привіт, що таке ботулінотерапія?"}]}],
    "sessionToken":"smoke-test-123",
    "locale":"uk"
  }' --no-buffer 2>/dev/null | head -5
```

Expected: lines starting with `0:"` (UI message stream format).

- [ ] **Step 3: Commit**

```bash
git add src/app/api/chat/route.ts
git commit -m "feat(chat): POST /api/chat with streamText v6 + Helyos tools"
```

---

## Task 9: useChatSession hook

**Files:**
- Create: `src/components/chat/useChatSession.ts`

- [ ] **Step 1: Create hook**

Create `src/components/chat/useChatSession.ts`:

```ts
"use client";

import { useEffect, useState } from "react";

export function useChatSession(): string | null {
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  useEffect(() => {
    const key = "genevity_chat_session";
    let token = sessionStorage.getItem(key);
    if (!token) {
      token = crypto.randomUUID();
      sessionStorage.setItem(key, token);
    }
    setSessionToken(token);
  }, []);

  return sessionToken;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/chat/useChatSession.ts
git commit -m "feat(chat): useChatSession hook"
```

---

## Task 10: ChatMessage component

**Files:**
- Create: `src/components/chat/ChatMessage.tsx`

- [ ] **Step 1: Create component**

Create `src/components/chat/ChatMessage.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export default function ChatMessage({ role, content, isStreaming }: Props) {
  const isBot = role === "assistant";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex", isBot ? "justify-start" : "justify-end")}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isBot
            ? "bg-[var(--color-champagne-dark)] text-[var(--color-black)] rounded-tl-sm"
            : "bg-[var(--color-main)] text-white rounded-tr-sm"
        )}
      >
        {content}
        {isStreaming && (
          <span className="inline-block w-1 h-3.5 ml-0.5 bg-current opacity-70 animate-pulse rounded-full align-middle" />
        )}
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/chat/ChatMessage.tsx
git commit -m "feat(chat): ChatMessage bubble"
```

---

## Task 11: ChatPanel component

**Files:**
- Create: `src/components/chat/ChatPanel.tsx`

- [ ] **Step 1: Create panel (AI SDK v6 useChat)**

Create `src/components/chat/ChatPanel.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X } from "lucide-react";
import ChatMessage from "./ChatMessage";
import { useChatSession } from "./useChatSession";

interface ChatState {
  suggestions: string[];
  urgency: "browsing" | "interested" | "ready_to_book";
  shouldEscalate: boolean;
  escalationTarget: "genevity" | "helyos";
  escalationHint: string | null;
  collectedName: string | null;
  collectedPhone: string | null;
}

interface Props {
  onClose: () => void;
  onEscalate: (target: "genevity" | "helyos", summary: string) => void;
  pageUrl: string;
  pageTitle: string;
  locale: string;
  onLocaleChange: (locale: string) => void;
}

const LOCALES = ["uk", "ru", "en"] as const;
const IDLE_MS = 8_000;

export default function ChatPanel({
  onClose,
  onEscalate,
  pageUrl,
  pageTitle,
  locale,
  onLocaleChange,
}: Props) {
  const sessionToken = useChatSession();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [chatState, setChatState] = useState<ChatState>({
    suggestions: ["Наші послуги", "Наші лікарі", "Ціни"],
    urgency: "browsing",
    shouldEscalate: false,
    escalationTarget: "genevity",
    escalationHint: null,
    collectedName: null,
    collectedPhone: null,
  });
  const [escalationOffered, setEscalationOffered] = useState(false);
  const [showEscalatePrompt, setShowEscalatePrompt] = useState(false);

  const { messages, sendMessage, addToolOutput, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { sessionToken, locale, pageUrl, pageTitle },
    }),
    onToolCall: ({ toolCall }) => {
      if (toolCall.dynamic) return;
      if (toolCall.toolName === "updateChatState") {
        const args = toolCall.input as ChatState;
        setChatState(args);
        if (args.shouldEscalate && !escalationOffered) {
          setEscalationOffered(true);
          setShowEscalatePrompt(true);
        }
        addToolOutput({ toolCallId: toolCall.toolCallId, output: "ok" });
      }
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 8-second idle trigger
  useEffect(() => {
    if (messages.length > 0 || !sessionToken) return;
    const timer = setTimeout(() => {
      sendMessage({ text: "__idle__" });
    }, IDLE_MS);
    return () => clearTimeout(timer);
  }, [messages.length, sessionToken, sendMessage]);

  const isStreaming = status === "streaming" || status === "submitted";
  const lastBotMsg = [...messages].reverse().find((m) => m.role === "assistant");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.97 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex flex-col w-[360px] h-[520px] rounded-2xl shadow-2xl overflow-hidden border border-[var(--color-champagne-darker)]"
      style={{ background: "var(--color-champagne)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-main)] text-white shrink-0">
        <span
          className="text-sm font-semibold tracking-wide"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          GENEVITY Асистент
        </span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white/20 rounded-lg px-2 py-1">
            {LOCALES.map((l) => (
              <button
                key={l}
                onClick={() => onLocaleChange(l)}
                className={`text-xs px-1 rounded transition-colors ${
                  locale === l ? "text-white font-semibold" : "text-white/60 hover:text-white"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((m, i) => {
          // Extract text from parts (v6 API)
          const text = m.parts
            .filter((p): p is { type: "text"; text: string } => p.type === "text")
            .map((p) => p.text)
            .join("");
          if (!text || text.startsWith("__")) return null;
          return (
            <ChatMessage
              key={m.id}
              role={m.role as "user" | "assistant"}
              content={text}
              isStreaming={isStreaming && i === messages.length - 1 && m.role === "assistant"}
            />
          );
        })}

        {/* Quick-reply chips */}
        {!isStreaming && chatState.suggestions.length > 0 && lastBotMsg && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-1.5 pt-1"
          >
            {chatState.suggestions.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage({ text: s })}
                className="text-xs px-3 py-1.5 rounded-full border border-[var(--color-main)] text-[var(--color-main)] hover:bg-[var(--color-main)] hover:text-white transition-colors"
              >
                {s}
              </button>
            ))}
          </motion.div>
        )}

        {/* Bot-initiated escalation prompt */}
        <AnimatePresence>
          {showEscalatePrompt && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-[var(--color-champagne-dark)] border border-[var(--color-champagne-darker)] rounded-xl p-3 text-sm"
            >
              <p className="text-[var(--color-black)] mb-2">
                {chatState.escalationTarget === "helyos"
                  ? "Хочете, щоб я з'єднав вас з оператором Helyos?"
                  : "Хочете, щоб наш адміністратор зв'язався з вами?"}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowEscalatePrompt(false);
                    onEscalate(
                      chatState.escalationTarget,
                      chatState.escalationHint ?? ""
                    );
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-[var(--color-main)] text-white text-xs font-medium"
                >
                  Так, з'єднайте
                </button>
                <button
                  onClick={() => setShowEscalatePrompt(false)}
                  className="flex-1 py-1.5 rounded-lg border border-[var(--color-main)] text-[var(--color-main)] text-xs"
                >
                  Ні, ще питання
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Connect to operator */}
      <div className="px-4 pb-1 shrink-0">
        <button
          onClick={() =>
            onEscalate(chatState.escalationTarget, chatState.escalationHint ?? "")
          }
          className="w-full py-2 text-xs text-[var(--color-main)] border border-[var(--color-main-lighter)] rounded-xl hover:bg-[var(--color-main-subtle)] transition-colors flex items-center justify-center gap-1.5"
        >
          📞 Зв'язатись з оператором
        </button>
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim() || isStreaming || !sessionToken) return;
          sendMessage({ text: input });
          setInput("");
        }}
        className="flex gap-2 px-4 pb-4 pt-2 shrink-0"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            locale === "ru"
              ? "Напишите вопрос..."
              : locale === "en"
              ? "Ask a question..."
              : "Напишіть питання..."
          }
          disabled={isStreaming || !sessionToken}
          className="flex-1 px-3 py-2 text-sm rounded-xl border border-[var(--color-champagne-darker)] bg-white focus:outline-none focus:border-[var(--color-main)] disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isStreaming || !input.trim() || !sessionToken}
          className="w-9 h-9 rounded-xl bg-[var(--color-main)] text-white flex items-center justify-center disabled:opacity-40 hover:bg-[var(--color-main-dark)] transition-colors shrink-0"
        >
          <Send size={14} />
        </button>
      </form>
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/chat/ChatPanel.tsx
git commit -m "feat(chat): ChatPanel with streaming, chips, escalation (AI SDK v6)"
```

---

## Task 12: ChatEscalation component

**Files:**
- Create: `src/components/chat/ChatEscalation.tsx`

- [ ] **Step 1: Create component**

Create `src/components/chat/ChatEscalation.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import { X, Phone, MessageCircle } from "lucide-react";

interface Props {
  target: "genevity" | "helyos";
  summary: string;
  onClose: () => void;
  onOpenBinotel: () => void;
}

const PHONES = {
  genevity: "056 794 70 00",
  helyos: "+38 (067) 000 01 50",
};

export default function ChatEscalation({ target, summary, onClose, onOpenBinotel }: Props) {
  const isHelyos = target === "helyos";
  const phone = PHONES[target];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col w-[360px] rounded-2xl shadow-2xl overflow-hidden border border-[var(--color-champagne-darker)]"
      style={{ background: "var(--color-champagne)" }}
    >
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-main)] text-white">
        <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
          {isHelyos ? "Перенаправлення до Helyos" : "З'єднання з оператором"}
        </span>
        <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="px-5 py-5 space-y-4">
        <p className="text-sm text-[var(--color-black-80)]">
          Передаю вас адміністратору {isHelyos ? "Helyos" : "GENEVITY"}...
        </p>

        {summary && (
          <div className="bg-[var(--color-champagne-dark)] rounded-xl px-4 py-3 text-sm">
            <p className="text-xs text-[var(--color-stone)] mb-1 uppercase tracking-wide">
              Ваш запит
            </p>
            <p className="text-[var(--color-black)]">{summary}</p>
          </div>
        )}

        <div className="space-y-2 pt-1">
          <button
            onClick={onOpenBinotel}
            className="w-full py-3 rounded-xl bg-[var(--color-main)] text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-[var(--color-main-dark)] transition-colors"
          >
            <MessageCircle size={15} />
            Відкрити чат з оператором
          </button>

          <a
            href={`tel:${phone.replace(/[\s()]/g, "")}`}
            className="w-full py-3 rounded-xl border border-[var(--color-main)] text-[var(--color-main)] text-sm font-medium flex items-center justify-center gap-2 hover:bg-[var(--color-main-subtle)] transition-colors"
          >
            <Phone size={15} />
            Зателефонувати: {phone}
          </a>
        </div>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/chat/ChatEscalation.tsx
git commit -m "feat(chat): ChatEscalation screen"
```

---

## Task 13: ChatWidget orchestrator + layout

**Files:**
- Create: `src/components/chat/ChatWidget.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create ChatWidget**

Create `src/components/chat/ChatWidget.tsx`:

```tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import ChatPanel from "./ChatPanel";
import ChatEscalation from "./ChatEscalation";

type View = "closed" | "chat" | "escalation";

declare global {
  interface Window {
    binotelChatWidget?: { open: () => void };
  }
}

export default function ChatWidget() {
  const [view, setView] = useState<View>("closed");
  const [locale, setLocale] = useState("uk");
  const [escalationTarget, setEscalationTarget] = useState<"genevity" | "helyos">("genevity");
  const [escalationSummary, setEscalationSummary] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [pageTitle, setPageTitle] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (window.location.pathname.startsWith("/admin")) {
      setIsAdmin(true);
      return;
    }
    setPageUrl(window.location.href);
    setPageTitle(document.title);
    const lang = navigator.language.slice(0, 2).toLowerCase();
    if (lang === "ru") setLocale("ru");
    else if (lang === "en") setLocale("en");
    else setLocale("uk");
  }, []);

  const handleEscalate = useCallback(
    (target: "genevity" | "helyos", summary: string) => {
      setEscalationTarget(target);
      setEscalationSummary(summary);
      setView("escalation");
    },
    []
  );

  const handleOpenBinotel = useCallback(() => {
    const prefill = escalationSummary
      ? (escalationTarget === "helyos"
          ? "Пацієнт з сайту GENEVITY. "
          : "") + escalationSummary
      : "";

    if (window.binotelChatWidget?.open) {
      window.binotelChatWidget.open();
    }

    if (prefill) {
      setTimeout(() => {
        const input = document.querySelector<HTMLInputElement>(
          "[class*='binotel'] input[type='text'], .binotel-chat-input"
        );
        if (input) {
          input.value = prefill;
          input.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }, 800);
    }
    setView("closed");
  }, [escalationTarget, escalationSummary]);

  if (isAdmin) return null;

  return (
    <>
      <style>{`
        [class*="binotel-chat-button"],
        [class*="binotel-launcher"],
        [id*="binotel-chat-button"] { display: none !important; }
      `}</style>

      <AnimatePresence>
        {view === "closed" && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setView("chat")}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            style={{ background: "var(--color-main)" }}
            aria-label="Відкрити чат"
          >
            <MessageCircle size={24} color="white" />
          </motion.button>
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence mode="wait">
          {view === "chat" && (
            <ChatPanel
              key="chat"
              onClose={() => setView("closed")}
              onEscalate={handleEscalate}
              pageUrl={pageUrl}
              pageTitle={pageTitle}
              locale={locale}
              onLocaleChange={setLocale}
            />
          )}
          {view === "escalation" && (
            <ChatEscalation
              key="escalation"
              target={escalationTarget}
              summary={escalationSummary}
              onClose={() => setView("closed")}
              onOpenBinotel={handleOpenBinotel}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Add ChatWidget to layout.tsx**

Open `src/app/layout.tsx`. Add the import:

```tsx
import ChatWidget from "@/components/chat/ChatWidget";
```

Then inside `<body>`, after the Binotel `<Script>` and before `</body>`:

```tsx
<ChatWidget />
```

- [ ] **Step 3: Run build check**

```bash
npm run build 2>&1 | tail -20
```

Expected: no TypeScript errors. Fix any type errors before committing.

- [ ] **Step 4: Commit**

```bash
git add src/components/chat/ChatWidget.tsx src/app/layout.tsx
git commit -m "feat(chat): ChatWidget orchestrator + layout integration"
```

---

## Task 14: Admin Чати pages

**Files:**
- Create: `src/app/(admin)/admin/chats/page.tsx`
- Create: `src/app/(admin)/admin/chats/[id]/page.tsx`
- Modify: `src/app/(admin)/admin/_components/admin-sidebar.tsx`

- [ ] **Step 1: Create chats list page**

Create `src/app/(admin)/admin/chats/page.tsx`:

```tsx
import Link from "next/link";
import { sql } from "@/lib/db/client";
import { requireSession } from "../_actions/auth";
import { AdminPageHeader } from "../_components/admin-list";
import { cn } from "@/lib/utils";

export default async function ChatsPage() {
  await requireSession();

  const rows = await sql`
    SELECT
      id, session_token, locale, started_at, escalated_at,
      escalation_target, patient_name, patient_phone, patient_interest,
      page_title, page_url,
      (SELECT count(*)::int FROM chat_messages WHERE session_id = chat_sessions.id) AS message_count
    FROM chat_sessions
    ORDER BY started_at DESC
    LIMIT 100
  `;

  return (
    <div className="p-8">
      <AdminPageHeader title="Чати" subtitle={`${rows.length} сесій`} />
      <div className="mt-6 border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted text-muted-foreground text-left">
              <th className="px-4 py-3 font-medium">Дата</th>
              <th className="px-4 py-3 font-medium">Мова</th>
              <th className="px-4 py-3 font-medium">Пацієнт</th>
              <th className="px-4 py-3 font-medium">Сторінка</th>
              <th className="px-4 py-3 font-medium text-center">Повідом.</th>
              <th className="px-4 py-3 font-medium">Ескалація</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id as string}
                className={cn(
                  "border-t border-border hover:bg-muted/40 transition-colors",
                  r.escalated_at && "bg-amber-50/30"
                )}
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/chats/${r.id}`}
                    className="hover:underline text-foreground"
                  >
                    {new Date(r.started_at as string).toLocaleString("uk-UA", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Link>
                </td>
                <td className="px-4 py-3 uppercase text-xs">{r.locale as string}</td>
                <td className="px-4 py-3">
                  <div>
                    {(r.patient_name as string | null) ?? (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                  {r.patient_phone && (
                    <div className="text-xs text-muted-foreground font-mono">
                      {r.patient_phone as string}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground max-w-[180px] truncate">
                  {(r.page_title as string | null) ??
                    (r.page_url as string | null) ??
                    "—"}
                </td>
                <td className="px-4 py-3 text-center">{r.message_count as number}</td>
                <td className="px-4 py-3">
                  {r.escalated_at ? (
                    <span
                      className={cn(
                        "inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium",
                        r.escalation_target === "helyos"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-700"
                      )}
                    >
                      {r.escalation_target === "helyos" ? "Helyos" : "Genevity"}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create chat detail page**

Create `src/app/(admin)/admin/chats/[id]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { sql } from "@/lib/db/client";
import { requireSession } from "../../_actions/auth";
import { cn } from "@/lib/utils";

export default async function ChatDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id } = await params;

  const [sessionRows, messageRows] = await Promise.all([
    sql`SELECT * FROM chat_sessions WHERE id = ${id} LIMIT 1`,
    sql`
      SELECT role, content, created_at
      FROM chat_messages
      WHERE session_id = ${id}
      ORDER BY created_at ASC
    `,
  ]);

  if (!sessionRows[0]) notFound();

  const session = sessionRows[0];
  const messages = messageRows as Array<{
    role: string;
    content: string;
    created_at: string;
  }>;

  return (
    <div className="p-8 max-w-2xl">
      <Link
        href="/admin/chats"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft size={14} /> Усі чати
      </Link>

      <div className="mb-6 space-y-1 text-sm border border-border rounded-xl p-4 bg-muted/20">
        <div>
          <span className="text-muted-foreground">Початок: </span>
          {new Date(session.started_at as string).toLocaleString("uk-UA")}
        </div>
        <div>
          <span className="text-muted-foreground">Мова: </span>
          {(session.locale as string).toUpperCase()}
        </div>
        {session.patient_name && (
          <div>
            <span className="text-muted-foreground">Пацієнт: </span>
            {session.patient_name as string}
          </div>
        )}
        {session.patient_phone && (
          <div>
            <span className="text-muted-foreground">Телефон: </span>
            <span className="font-mono">{session.patient_phone as string}</span>
          </div>
        )}
        {session.patient_interest && (
          <div>
            <span className="text-muted-foreground">Інтерес: </span>
            {session.patient_interest as string}
          </div>
        )}
        {session.escalated_at && (
          <div>
            <span className="text-muted-foreground">Ескалація → </span>
            <span className="font-medium">{session.escalation_target as string}</span>
            {" "}({new Date(session.escalated_at as string).toLocaleString("uk-UA")})
          </div>
        )}
        {session.summary && (
          <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
            <span className="text-muted-foreground text-xs uppercase tracking-wide block mb-1">
              Summary для оператора
            </span>
            {session.summary as string}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {messages.map((m, i) => {
          if (m.content.startsWith("__")) return null;
          return (
            <div
              key={i}
              className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                  m.role === "user"
                    ? "bg-[var(--color-main)] text-white rounded-tr-sm"
                    : "bg-[var(--color-champagne-dark)] text-[var(--color-black)] rounded-tl-sm"
                )}
              >
                {m.content}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add "Чати" to admin sidebar**

Open `src/app/(admin)/admin/_components/admin-sidebar.tsx`. Find the navigation link for "Заявки" (forms) and add a "Чати" link in the same pattern directly below it:

```tsx
// Find this pattern (exact classNames will vary — match what's already there):
<Link href="/admin/forms" ...>Заявки</Link>

// Add after it:
<Link href="/admin/chats" ...>Чати</Link>
```

Copy the exact className from the existing "Заявки" link.

- [ ] **Step 4: Build check**

```bash
npm run build 2>&1 | tail -20
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/\(admin\)/admin/chats/ src/app/\(admin\)/admin/_components/admin-sidebar.tsx
git commit -m "feat(chat): admin Чати list + detail pages"
```

---

## Task 15: Populate agent.md + end-to-end test

- [ ] **Step 1: Fill agent.md with real data from Task 5 queries**

Replace all `[...]` placeholders in `src/lib/chat/agent.md` with actual services, prices, and doctor names obtained in Task 5 steps 1 and 2.

- [ ] **Step 2: Start dev server**

```bash
npm run dev
```

- [ ] **Step 3: Test basic conversation**

Open `http://localhost:3000`. Click floating chat button.
Send: *"Що таке ботулінотерапія?"*
Expected: streaming response, 3–4 quick-reply chips appear below bot message.

- [ ] **Step 4: Test Helyos cross-referral**

Send: *"А є у вас кардіологія?"*
Expected: bot calls `searchHelyosServices`, responds with Helyos cardiology details. Escalation target = "helyos".

- [ ] **Step 5: Test urgency + escalation**

Send: *"Хочу записатися цього тижня"*
Expected: escalation prompt appears immediately (ready_to_book). Click "Так, з'єднайте" → escalation screen with summary.

- [ ] **Step 6: Test language switcher**

Switch to "ru" in chat header. Send a message. Expected: bot replies in Russian.

- [ ] **Step 7: Test admin panel**

Open `http://localhost:3000/admin/chats`.
Expected: sessions from test above are listed. Click one → full message history visible.

- [ ] **Step 8: Final build + push**

```bash
npm run build && git push origin develop
```

---

## Env Vars to Add in Vercel Dashboard

For both `develop` (preview) and `main` (production) environments:

```
OPENAI_API_KEY=sk-...          (or use Vercel AI Gateway OIDC — no key needed)
HELYOS_DATABASE_URL=postgres://...
```
