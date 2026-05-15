import { sql } from "@/lib/db/client";
import { requireSession } from "../_actions/auth";
import Image from "next/image";
import { Plus, Cpu } from "lucide-react";
import { AdminPageHeader, AdminPrimaryButton, AdminList, AdminListItem } from "../_components/admin-list";

const categoryLabels: Record<string, string> = {
  face: "Face", body: "Body", skin: "Skin", intimate: "Intimate", laser: "Laser",
};

export default async function EquipmentListPage() {
  await requireSession();
  const items = await sql`SELECT * FROM equipment ORDER BY sort_order`;

  return (
    <div className="p-8">
      <AdminPageHeader
        title="Equipment"
        subtitle={`${items.length} devices`}
        actions={<AdminPrimaryButton href="/admin/equipment/new"><Plus size={16} /> Add Equipment</AdminPrimaryButton>}
      />
      <AdminList empty="No equipment yet">
        {items.map((item) => (
          <AdminListItem
            key={item.id}
            href={`/admin/equipment/${item.id}`}
            title={item.name}
            subtitle={item.short_description_uk}
            leading={
              <div className="w-12 h-12 rounded-xl bg-champagne overflow-hidden shrink-0">
                {item.photo ? (
                  <Image src={item.photo} alt={item.name} width={48} height={48} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted"><Cpu size={20} /></div>
                )}
              </div>
            }
            badge={
              <span className="text-xs text-main bg-main/10 px-2 py-1 rounded-full">
                {categoryLabels[item.category] || item.category}
              </span>
            }
          />
        ))}
      </AdminList>
    </div>
  );
}
