"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, Stethoscope, Cpu,
  StickyNote, MessageSquare, Image as ImageIcon, Settings, LogOut, BookOpen,
  DollarSign,
} from "lucide-react";
import { logout } from "../_actions/auth";
import Button from "@/components/ui/Button";

type NavLink = { href: string; label: string; icon: any; countKey?: string };
type NavDivider = { divider: true; label: string };
type NavItem = NavLink | NavDivider;

const navItems: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { divider: true, label: "CONTENT" },
  { href: "/admin/pages", label: "Pages", icon: StickyNote },
  { href: "/admin/services", label: "Services", icon: FileText, countKey: "services" },
  { href: "/admin/doctors", label: "Doctors", icon: Stethoscope, countKey: "doctors" },
  { href: "/admin/equipment", label: "Equipment", icon: Cpu, countKey: "equipment" },
  { href: "/admin/pricing", label: "Pricing", icon: DollarSign },
  { href: "/admin/blog", label: "Blog", icon: BookOpen },
  { divider: true, label: "OPERATIONS" },
  { href: "/admin/forms", label: "Forms", icon: MessageSquare, countKey: "forms" },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
];

interface SidebarProps {
  userName: string;
  counts?: Record<string, number>;
}

export default function Sidebar({ userName, counts = {} }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="m-2 fixed left-0 top-0 bottom-0 w-60 bg-ink rounded-3xl flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Image
            src="/brand/LogoFullLight.svg"
            alt="GENEVITY"
            width={180}
            height={40}
            className="h-8 text-black w-auto"
            priority
          />
          <span className="text-[10px] font-medium text-champagne bg-main/20 px-1.5 py-0.5 rounded">CMS</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {navItems.map((item, i) => {
          if ("divider" in item) {
            return (
              <p key={i} className="text-[10px] font-semibold text-muted uppercase tracking-[0.15em] px-2 pt-5 pb-2">
                {item.label}
              </p>
            );
          }

          const link = item as NavLink;
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
          const count = link.countKey ? counts[link.countKey] : undefined;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors mb-0.5 group ${
                isActive
                  ? "bg-main/20 text-champagne"
                  : "text-champagne/50 hover:text-champagne/80 hover:bg-champagne/10 active:bg-champagne/15"
              }`}
            >
              <Icon size={18} className={isActive ? "text-champagne" : "text-champagne/80 group-hover:text-champagne/80"} />
              <span className="flex-1">{item.label}</span>
              {count !== undefined && count > 0 && (
                <span className={`text-[11px] min-w-[20px] text-center rounded-full px-1.5 py-0.5 ${
                  link.countKey === "forms" ? "bg-error/20 text-error" : "bg-black/5 text-black/50"
                }`}>
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Settings + User */}
      <div className="border-t border-white/10 px-3 py-2">
        {(() => {
          const isActive = pathname?.startsWith("/admin/settings") ?? false;
          return (
            <Link
              href="/admin/settings"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-main/20 text-champagne"
                  : "text-champagne/50 hover:text-champagne/80 hover:bg-champagne/10 active:bg-champagne/15"
              }`}
            >
              <Settings size={18} className={isActive ? "text-champagne" : "text-champagne/80 group-hover:text-champagne/80"} />
              <span>Settings</span>
            </Link>
          );
        })()}
      </div>

      <div className="border-t border-white/10 px-3 py-3">
        <div className="flex items-center justify-between gap-2 px-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-main/30 flex items-center justify-center text-champagne text-xs font-medium shrink-0">
              A
            </div>
            <span className="text-sm text-champagne/80 truncate">Admin</span>
          </div>
          <form action={logout}>
            <Button variant="secondary" icon size="sm" type="submit" title="Log out" ariaLabel="Log out">
              <LogOut size={14} />
            </Button>
          </form>
        </div>
      </div>
    </aside>
  );
}
