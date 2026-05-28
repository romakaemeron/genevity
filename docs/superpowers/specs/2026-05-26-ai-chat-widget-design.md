# AI Chat Widget — Свiтлана (GENEVITY)

**Date:** 2026-05-26  
**Status:** Approved — ready for implementation  
**Dev codename:** Свiтлана (replace with final name before launch)  
**Public persona name:** Ліна (placeholder — confirm before launch)

---

## Overview

A proactive AI chat widget embedded in the Genevity website. Свiтлана acts as a knowledgeable clinic assistant — answers questions about services, doctors, cosmetology, and longevity — but never books appointments directly (operators handle that). When a patient is ready to book or requests it, the bot hands off to a live operator via the existing Binotel Online Chat widget.

Свiтлана also knows the full catalogue of **Helyos** (sister clinic, 200+ doctors, 300+ directions) and can discuss it in depth via on-demand DB tool calls — only fetching Helyos data when the conversation requires it, keeping token usage minimal.

**Model:** GPT-4o-mini (Vercel AI SDK, streaming)  
**Cost estimate:** ~$1–3/month at typical clinic traffic  
**Languages:** Ukrainian (default), Russian, English — auto-detected from browser/locale with manual switcher in chat header

---

## Architecture

```
Patient on site
      │
      ▼
Floating Chat Button  (bottom-right, Genevity brand colors)
      │ click
      ▼
Chat Panel Overlay
  ├── Language switcher (uk / ru / en) — top right of header
  ├── Streaming message list
  ├── Quick reply chips (2–4 per bot message)
  ├── "Зв'язатись з оператором" button — always visible above input
  └── Text input
      │
      ▼
POST /api/chat  (Next.js Route Handler)
  ├── Vercel AI SDK — streamText (GPT-4o-mini)
  ├── System prompt = role + agent.md (Genevity knowledge)
  ├── Tools (called on-demand by the model):
  │   ├── searchHelyosServices(query)   → Helyos Neon DB
  │   ├── searchHelyosDoctors(specialty) → Helyos Neon DB
  │   └── getHelyosServiceDetail(id)    → Helyos Neon DB
  ├── Structured output: message, suggestions, urgency,
  │   shouldEscalate, escalationHint, escalationTarget,
  │   collectedName, collectedPhone
  └── Saves messages to Neon DB
      │
      ▼
Neon DB  (chat_sessions + chat_messages tables)
      │
  on escalation
      ▼
window.binotelChatWidget.open()
  + pre-filled summary + source clinic (Genevity or Helyos)
```

**Binotel coexistence:** The Binotel widget script remains in the DOM but its launcher button is hidden via CSS (`[data-binotel-widget-launcher] { display: none }`). On escalation, Binotel is programmatically opened and our chat panel is dismissed.

---

## Database Schema

```sql
CREATE TABLE chat_sessions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token    text UNIQUE NOT NULL,   -- stored in localStorage
  locale           text NOT NULL DEFAULT 'uk',
  started_at       timestamptz NOT NULL DEFAULT now(),
  escalated_at     timestamptz,
  escalation_by    text,                   -- 'bot' | 'user'
  summary          text,                   -- auto-generated for operator
  patient_name     text,                   -- passively collected if mentioned
  patient_phone    text,                   -- passively collected if mentioned
  patient_interest text,                   -- topic(s) discussed
  page_url         text,                   -- page where chat was opened
  page_title       text
);

CREATE TABLE chat_messages (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role         text NOT NULL,              -- 'user' | 'assistant'
  content      text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ON chat_messages(session_id, created_at);
```

**Session lifecycle:** Created on first message. `session_token` (random UUID) stored in `localStorage` — history persists across page navigations within the same browser session but not permanently.

**On escalation:** Bot generates a `summary` string (e.g., *"Пацієнт: Олена. Цікавиться ботулінотерапією, хоче записатись цього тижня."*) stored in `chat_sessions.summary` and pre-filled into the Binotel chat opener.

---

## AI Behaviour

### Model & Output

Every `/api/chat` request uses `streamText` with a **structured final object** appended after the streamed message text:

```ts
interface ChatResponse {
  message: string;
  suggestions: string[];       // 2–4 quick reply labels
  urgency: 'browsing' | 'interested' | 'ready_to_book';
  shouldEscalate: boolean;
  escalationHint: string | null;
  escalationTarget: 'genevity' | 'helyos'; // which clinic operator to open
  collectedName: string | null;
  collectedPhone: string | null;
}
```

### Escalation Timing by Urgency

| Urgency | Trigger for escalation offer |
|---|---|
| `browsing` | After 5–6 exchanges |
| `interested` | After 2–3 exchanges |
| `ready_to_book` | Immediately on detection |

The bot offers escalation **once per session** unless the user declines, then again only when urgency upgrades to `ready_to_book`.

### Knowledge Base — `agent.md` (Genevity) + Helyos tools

**Genevity:** `src/lib/chat/agent.md` — loaded in full on every request. The model is instructed to **only reference facts listed in this file** for Genevity — it must never invent services, prices, or doctor names not present. Admins update this file; no redeploy needed.

**Helyos:** NOT pre-loaded. The model calls tools on demand when the conversation touches topics outside Genevity's scope. This keeps the base prompt lean while giving Свiтлана full depth on both clinics.

Structure:
```markdown
# GENEVITY — база знань асистента Свiтлана

## Клініка
Назва, адреса, телефон, графік роботи, філософія...

## Послуги
### Ботулінотерапія
Опис, ціна від X грн, лікарі які проводять...
### Біоревіталізація
...

## Лікарі
### Ім'я Прізвище
Спеціалізація, досвід, послуги...

## FAQ
...

## Що НЕ робимо (важливо)
Хірургія, стоматологія — направляємо далі...

## Інструкції для Джидяри
- Записи на прийом НЕ робиш — передай оператору
- Будь проактивним: пропонуй пов'язані теми
- Відстежуй urgency пацієнта
- Cross-sell логічно (наприклад, ботулінотерапія + біоревіталізація)
...
```

### System Prompt Structure

```
1. РОЛЬ — хто ти, характер, мова відповіді
2. БАЗА ЗНАНЬ — повний вміст agent.md
3. КОНТЕКСТ СТОРІНКИ — URL + заголовок де відкрито чат
4. ПРАВИЛА ВІДПОВІДІ — формат JSON, обмеження теми
5. ІСТОРІЯ — останні N повідомлень сесії
```

---

## Helyos Cross-Referral

### Concept

When a patient asks about something outside Genevity's profile (surgery, cardiology, oncology, IVF, diagnostics, etc.), Свiтлана discusses it in full depth by querying the Helyos Neon DB on demand — then offers to connect the patient with a Helyos operator.

### On-Demand Tools (Vercel AI SDK tool calls)

```ts
searchHelyosServices(query: string)
// Full-text search across Helyos services/directions
// SQL: SELECT id, title, category, price_from, description
//      FROM services WHERE to_tsvector('russian', title || ' ' || description)
//      @@ plainto_tsquery('russian', query) LIMIT 5

searchHelyosDoctors(specialty: string)
// Find Helyos doctors by specialization
// SQL: SELECT name, role, photo, experience FROM doctors
//      WHERE role ILIKE '%' || specialty || '%' LIMIT 5

getHelyosServiceDetail(serviceId: string)
// Full details: description, prices, related doctors
// SQL: SELECT s.*, array_agg(d.name) as doctors FROM services s
//      LEFT JOIN doctor_services ds ON ... WHERE s.id = serviceId
```

**Token cost:** 0 extra tokens when conversation stays in Genevity. ~200–500 tokens per Helyos tool call (only relevant rows returned).

### Helyos DB Connection

Separate `HELYOS_DATABASE_URL` env var pointing to Helyos Neon project. A dedicated `helyosSql` client instance in `src/lib/db/helyos.ts` — mirrors the existing `sql` client pattern.

### Cross-Referral Flow

```
Patient: "А є у вас кардіологія?"
         │
         ▼
Bot detects: not in Genevity scope
         │
         ▼
Calls: searchHelyosServices("кардіологія")
→ returns: кардіолог + 3 relevant services from Helyos DB
         │
         ▼
Bot: "У GENEVITY ми спеціалізуємось на естетичній медицині,
     але наша партнерська клініка Helyos має повний кардіологічний
     відділ. Там працює [ім'я лікаря], спеціаліст з [...]
     Ціна консультації від [X] грн.
     Хочете, щоб я з'єднав вас з оператором Helyos?"

Buttons: [ Так, з'єднайте з Helyos ]  [ Ні, дякую ]
```

### Escalation to Helyos Operator

When `escalationTarget: 'helyos'`:
- Binotel opens (same account)
- Pre-filled message: *"Пацієнт з сайту GENEVITY. Цікавиться: [topic]. Направлений асистентом. Прохання допомогти."*
- Phone shown on escalation screen: `+38 (067) 000 01 50` (Helyos Dnipro)

---

## Proactive Behaviour

### Context-aware greeting (page-based)

| Page | Opening message |
|---|---|
| `/posluhy/botulinum-*` | "Бачу, вас цікавить ботулінотерапія! Розповісти про процедуру чи одразу про ціни?" |
| `/likari/[slug]` | "Хочете дізнатись більше про [ім'я лікаря] або записатись до неї?" |
| `/` (homepage) | "Привіт! Я Ліна, асистент GENEVITY. Чим можу допомогти?" |
| Any other page | Generic warm greeting + top 3 popular service chips |

### 8-second idle trigger

If chat is opened but no message sent within 8 seconds, bot sends a proactive prompt with 3 popular service quick-reply chips.

### Proactive suggestions after every response

Every bot message includes 2–4 `suggestions` chips that continue the conversation naturally. Examples after a botulinum answer:
- "Скільки це коштує?"
- "Як довго тримається ефект?"
- "Які є протипоказання?"
- "Хто з лікарів проводить?"

### Cross-sell proactivity

Bot recognises related service pairs and proactively mentions combinations where logical (e.g. botulinum + biorevitalisation, longevity programme + lab tests). This logic lives in `agent.md` instructions, not in code.

---

## Escalation Flow

### Bot-initiated
1. `shouldEscalate: true` returned in response
2. Chat shows: *"Хочете, щоб наш адміністратор зв'язався з вами?"*  
   Buttons: **[ Так, з'єднайте ]** / **[ Ні, ще питання ]**
3. On confirm → escalation screen → Binotel opens

### User-initiated (always-visible button)
1. Patient clicks "Зв'язатись з оператором" at any time
2. Same escalation screen

### Escalation screen
```
┌──────────────────────────────────┐
│  Передаю вас адміністратору...   │
│                                  │
│  Ваш запит:                      │
│  "[auto-generated summary]"      │
│                                  │
│  [ Відкрити чат з оператором ]   │
│  [ Зателефонувати: 056 794 70 00]│
└──────────────────────────────────┘
```

On "Відкрити чат": `window.binotelChatWidget.open()` is called, summary is pre-filled as the first message, our panel closes.

---

## Widget UI

### Floating button
- Bottom-right corner, above Binotel position
- Color: `--color-main` (taupe #8B7B6B)
- Icon: chat bubble SVG
- Binotel launcher hidden via CSS until escalation

### Chat panel
```
┌─────────────────────────────────┐
│  💬 GENEVITY Асистент   uk▾  ✕  │
├─────────────────────────────────┤
│                                 │
│  [Bot message — streaming ▌]    │
│                                 │
│  ┌──────────┐ ┌─────────────┐   │
│  │ Послуги  │ │ Наші лікарі │   │
│  └──────────┘ └─────────────┘   │
│                                 │
│               [Patient message] │
│                                 │
├─────────────────────────────────┤
│  [ Зв'язатись з оператором 📞 ] │
├─────────────────────────────────┤
│  [ Напишіть питання...    ➤ ]   │
└─────────────────────────────────┘
```

- **Fonts:** Montserrat (body), Cormorant (headings) — existing project fonts
- **Background:** `--color-champagne` (#FAF9F6)
- **Animations:** Framer Motion (already in project) — slide-up open, fade chips
- **Not rendered on** `/admin/*` routes (matches existing Binotel exclusion)

---

## Admin Panel Integration

New tab in `/admin/forms` — **"Чати"** alongside existing submissions:

- List of chat sessions: date, locale, page, urgency reached, escalated (yes/no)
- Click → full message history
- Shows `patient_name`, `patient_phone`, `patient_interest` if collected
- Sessions where `escalated_at IS NOT NULL` highlighted

---

## Files to Create / Modify

**New files:**
```
src/components/chat/
  ChatWidget.tsx          -- floating button + panel orchestrator
  ChatPanel.tsx           -- message list, input, quick replies
  ChatMessage.tsx         -- single message bubble
  ChatEscalation.tsx      -- escalation screen (Genevity or Helyos target)
  useChatSession.ts       -- session token, localStorage, session init
src/app/api/chat/
  route.ts                -- POST handler, streamText, tool calls, DB writes
src/lib/chat/
  agent.md                -- Genevity knowledge base (human-editable)
  prompt.ts               -- builds system prompt from agent.md + context
  session.ts              -- DB read/write helpers for sessions/messages
  helyos-tools.ts         -- AI SDK tool definitions + Helyos DB queries
src/lib/db/
  helyos.ts               -- Helyos Neon SQL client (HELYOS_DATABASE_URL)
```

**Modified files:**
```
src/app/layout.tsx               -- add <ChatWidget /> (exclude /admin)
src/app/(admin)/admin/forms/     -- add Чати tab
src/lib/db/migrations/           -- chat_sessions + chat_messages tables
```

**New env vars:**
```
OPENAI_API_KEY=sk-...
HELYOS_DATABASE_URL=postgres://...   -- Helyos Neon connection string
```

---

## Out of Scope (this spec)

- Voice input
- Image upload in chat
- Admin ability to edit `agent.md` via UI (future)
- Push notifications for new chat sessions
- Full Binotel API integration (not available)
- Syncing Genevity knowledge from DB into `agent.md` automatically (manual for now)
