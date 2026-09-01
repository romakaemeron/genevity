/**
 * Print the chat ids the bot can see, so TELEGRAM_CHAT_ID can be filled in.
 *
 * Telegram only reveals a chat once something has happened in it: add the bot
 * to the group and send any message (or press Start in a private chat), then
 *   npx tsx scripts/telegram-chat-id.ts
 * Group ids are negative — that's expected, keep the minus sign.
 *
 * Setup-only; nothing in the app calls this.
 */

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("TELEGRAM_BOT_TOKEN is not set (add it to .env.local)");
  process.exit(1);
}

const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
const json = (await res.json()) as {
  ok: boolean;
  description?: string;
  result?: Array<Record<string, { chat?: { id: number; type: string; title?: string; username?: string } }>>;
};

if (!json.ok) {
  console.error("Telegram error:", json.description);
  process.exit(1);
}

const seen = new Map<number, string>();
for (const update of json.result ?? []) {
  for (const payload of Object.values(update)) {
    const chat = payload?.chat;
    if (chat) seen.set(chat.id, `${chat.type} · ${chat.title ?? chat.username ?? "—"}`);
  }
}

if (!seen.size) {
  console.log("No chats yet. Send a message in the group with the bot in it, then re-run.");
} else {
  for (const [id, label] of seen) console.log(`TELEGRAM_CHAT_ID=${id}   (${label})`);
}
