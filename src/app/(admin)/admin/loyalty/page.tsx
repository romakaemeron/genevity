import Link from "next/link";
import { listCards } from "@/lib/db/queries/loyalty";
import { AdminPageHeader, AdminPrimaryButton } from "../_components/admin-list";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAdminLocale, getAdminStrings } from "../_i18n/server";

export const dynamic = "force-dynamic";

export default async function LoyaltyPage() {
  const [cards, t, locale] = await Promise.all([listCards(), getAdminStrings(), getAdminLocale()]);
  const l = t.loyaltyPage;
  const fmt = new Intl.DateTimeFormat(locale === "uk" ? "uk-UA" : locale === "ru" ? "ru-RU" : "en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div className="p-8">
      <AdminPageHeader
        title={l.title}
        subtitle={l.subtitle(cards.length)}
        actions={<AdminPrimaryButton href="/admin/loyalty/new">{l.issueNew}</AdminPrimaryButton>}
      />
      <Card className="p-0 overflow-hidden">
        {cards.length === 0 ? (
          <p className="p-8 text-sm text-muted-foreground text-center">{l.empty}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{l.colName}</TableHead>
                <TableHead>{l.colTier}</TableHead>
                <TableHead>{l.colStatus}</TableHead>
                <TableHead>{l.colIssued}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cards.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/loyalty/${c.id}`} className="hover:underline">{c.holderName}</Link>
                  </TableCell>
                  <TableCell>{l.tierValue(c.tier)}</TableCell>
                  <TableCell>
                    <span className={c.status === "active" ? "text-emerald-700" : "text-muted-foreground"}>
                      {c.status === "active" ? l.statusActive : l.statusRevoked}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{fmt.format(c.issuedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
