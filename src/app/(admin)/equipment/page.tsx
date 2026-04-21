import { sql } from "@/lib/db/client";
import { requireSession } from "../_actions/auth";
import Link from "next/link";
import Image from "next/image";
import { Plus, Cpu } from "lucide-react";

const categoryLabels: Record<string, string> = {
  face: "Face", body: "Body", skin: "Skin", intimate: "Intimate", laser: "Laser",
};

export default async function EquipmentListPage() {
  await requireSession();
  const items = await sql`SELECT * FROM equipment ORDER BY sort_order`;

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="heading-2 text-ink">Equipment</h1>
          <p className="body-m text-muted mt-1">{items.length} devices</p>
        </div>
        <Link href="/equipment/new" className="inline-flex items-center gap-2 px-4 py-2.5 bg-main text-champagne rounded-xl text-sm font-medium hover:bg-main-dark transition-colors">
          <Plus size={16} /> Add Equipment
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-line overflow-hidden">
        <div className="divide-y divide-line">
          {items.map((item) => (
            <Link key={item.id} href={`/equipment/${item.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-champagne/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-champagne-dark overflow-hidden shrink-0">
                {item.photo ? (
                  <Image src={item.photo} alt={item.name} width={48} height={48} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted"><Cpu size={20} /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink">{item.name}</p>
                <p className="text-xs text-muted truncate">{item.short_description_uk}</p>
              </div>
              <span className="text-xs text-main bg-main/10 px-2 py-1 rounded-full">{categoryLabels[item.category] || item.category}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
