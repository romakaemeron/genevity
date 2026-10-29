import Image from "next/image";
import { notFound } from "next/navigation";
import { getCardById } from "@/lib/db/queries/loyalty";
import { addPageUrl } from "@/lib/loyalty/urls";
import { qrSvg } from "@/lib/loyalty/qr";
import { AdminPageHeader, AdminSecondaryButton } from "../../_components/admin-list";
import { Card } from "@/components/ui/card";
import { getAdminLocale, getAdminStrings } from "../../_i18n/server";
import SharePanel from "../_components/share-panel";
import RevokeButton from "../_components/revoke-button";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function LoyaltyCardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();
  const card = await getCardById(id);
  if (!card) notFound();

  const [t, locale] = await Promise.all([getAdminStrings(), getAdminLocale()]);
  const l = t.loyaltyPage;
  const fmt = new Intl.DateTimeFormat(locale === "uk" ? "uk-UA" : locale === "ru" ? "ru-RU" : "en-GB", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
  const revoked = card.status === "revoked";

  const url = revoked ? null : addPageUrl(card.addToken);
  const svg = url ? await qrSvg(url) : null;

  return (
    <div className="p-8">
      <AdminPageHeader
        title={card.holderName}
        subtitle={`${l.tierValue(card.tier)} · ${revoked ? l.statusRevoked : l.statusActive}`}
        actions={<AdminSecondaryButton href="/admin/loyalty">{l.back}</AdminSecondaryButton>}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 flex flex-col gap-4">
          <h2 className="text-base font-semibold">{l.previewTitle}</h2>
          <div className="relative overflow-hidden rounded-xl">
            <Image
              src={`/loyalty/google-hero-${card.tier}.png`}
              alt=""
              width={1032}
              height={336}
              className="w-full h-auto"
            />
          </div>
          <p className="text-lg font-medium">{card.holderName}</p>
          <dl className="text-sm grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
            <dt className="text-muted-foreground">{l.colTier}</dt>
            <dd>{l.tierValue(card.tier)}</dd>
            <dt className="text-muted-foreground">{l.colStatus}</dt>
            <dd>{revoked ? l.statusRevoked : l.statusActive}</dd>
            <dt className="text-muted-foreground">{l.issuedOn}</dt>
            <dd>{fmt.format(card.issuedAt)}</dd>
            {revoked && card.revokedAt && (
              <>
                <dt className="text-muted-foreground">{l.revokedOn}</dt>
                <dd>{fmt.format(card.revokedAt)}</dd>
              </>
            )}
          </dl>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="p-6 flex flex-col gap-4">
            <h2 className="text-base font-semibold">{l.shareTitle}</h2>
            {url && svg ? (
              <SharePanel url={url} qrSvgMarkup={svg} />
            ) : (
              <p className="text-sm text-muted-foreground">{l.revokedInfo}</p>
            )}
          </Card>

          {!revoked && (
            <Card className="p-6 flex flex-col gap-4">
              <h2 className="text-base font-semibold">{l.cancelTitle}</h2>
              <RevokeButton id={card.id} />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
