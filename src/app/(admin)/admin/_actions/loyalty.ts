"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireSession } from "./auth";
import { logChange } from "@/lib/audit";
import { insertCard, getCardById, markRevoked, setGoogleObjectId } from "@/lib/db/queries/loyalty";
import { isUuid, parseIssueInput } from "@/lib/loyalty/validation";
import { expireObject, genericObjectId, isGoogleConfigured } from "@/lib/loyalty/google";

export type IssueState = { error?: string };
export type RevokeResult = { ok: boolean; googleWarning?: string; error?: string };

async function requireAdmin() {
  const session = await requireSession();
  if (session.role !== "admin") throw new Error("Forbidden");
  return session;
}

/** Maps validation.ts English messages to admin (uk) copy. */
function issueErrorUk(error: string): string {
  if (error === "Name is required") return "Вкажіть ім'я власника картки";
  if (error === "Name is too short") return "Ім'я надто коротке (мінімум 2 символи)";
  if (error === "Name contains invalid characters") return "Ім'я містить недопустимі символи";
  if (error.startsWith("Name must be at most")) return "Ім'я надто довге (максимум 80 символів)";
  if (error === "Tier must be 10 or 15") return "Оберіть знижку: 10% або 15%";
  return "Не вдалося перевірити дані картки";
}

export async function issueCard(_prev: IssueState, formData: FormData): Promise<IssueState> {
  const session = await requireAdmin();

  const parsed = parseIssueInput({ name: formData.get("name"), tier: formData.get("tier") });
  if (!parsed.ok) return { error: issueErrorUk(parsed.error) };

  let cardId: string;
  try {
    const card = await insertCard({ holderName: parsed.name, tier: parsed.tier, issuedBy: session.userId });
    cardId = card.id;

    if (isGoogleConfigured()) {
      try {
        await setGoogleObjectId(card.id, genericObjectId(process.env.GOOGLE_WALLET_ISSUER_ID!, card));
      } catch {
        // Best-effort: expireObject falls back to the deterministic id.
      }
    }

    await logChange({
      action: "create",
      entityType: "loyalty_card",
      entityId: card.id,
      entityLabel: card.holderName,
      after: { tier: card.tier },
    });
  } catch {
    return { error: "Не вдалося випустити картку. Спробуйте ще раз." };
  }

  revalidatePath("/admin/loyalty");
  // redirect() throws; it must stay outside try/catch.
  redirect(`/admin/loyalty/${cardId}`);
}

export async function revokeCardAction(id: string): Promise<RevokeResult> {
  const session = await requireAdmin();
  if (!isUuid(id)) return { ok: false, error: "Картку не знайдено" };

  const existing = await getCardById(id);
  if (!existing) return { ok: false, error: "Картку не знайдено" };

  // An already revoked card writes no second audit entry, but still re-attempts the
  // (idempotent) Google expiry so a failed first attempt can be retried.
  let revoked = existing;
  if (existing.status !== "revoked") {
    const updated = await markRevoked(id, session.userId);
    if (!updated) return { ok: false, error: "Картку не знайдено" };
    revoked = updated;

    await logChange({
      action: "update",
      entityType: "loyalty_card",
      entityId: revoked.id,
      entityLabel: revoked.holderName,
      before: { status: "active" },
      after: { status: "revoked" },
    });
    revalidatePath("/admin/loyalty");
    revalidatePath(`/admin/loyalty/${id}`);
  }

  if (!isGoogleConfigured()) return { ok: true };
  try {
    await expireObject(revoked);
  } catch {
    return {
      ok: true,
      googleWarning:
        "Картку скасовано, але не вдалося оновити її в Google Wallet. На Android вона може лишатися активною, доки не оновиться.",
    };
  }
  return { ok: true };
}
