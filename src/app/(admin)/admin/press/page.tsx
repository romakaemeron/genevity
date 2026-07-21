import { Plus, Newspaper, Eye, EyeOff } from "lucide-react";
import { requireSession } from "../_actions/auth";
import { adminGetAllMentions } from "@/lib/db/queries/media";
import { AdminPageHeader, AdminPrimaryButton, AdminList, AdminListItem } from "../_components/admin-list";
import { getAdminStrings } from "../_i18n/server";

export const dynamic = "force-dynamic";

export default async function PressAdminPage() {
  await requireSession();
  const [rows, t] = await Promise.all([adminGetAllMentions(), getAdminStrings()]);

  return (
    <div className="p-8 flex flex-col gap-8">
      <AdminPageHeader
        title={t.nav.items.press}
        subtitle={`${rows.length}`}
        actions={
          <AdminPrimaryButton href="/admin/press/new">
            <Plus size={16} /> Додати
          </AdminPrimaryButton>
        }
      />
      <AdminList empty="Ще немає записів.">
        {rows.map((r) => (
          <AdminListItem
            key={r.id}
            href={`/admin/press/${r.id}`}
            leading={<Newspaper size={16} className="text-main shrink-0" />}
            title={r.titleUk || r.url}
            subtitle={r.publisherName}
            trailing={
              r.isPublished ? (
                <Eye size={16} className="text-main shrink-0" />
              ) : (
                <EyeOff size={16} className="text-black-30 shrink-0" />
              )
            }
          />
        ))}
      </AdminList>
    </div>
  );
}
