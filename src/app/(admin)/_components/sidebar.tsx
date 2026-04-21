"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, Stethoscope, Cpu,
  StickyNote, MessageSquare, Image as ImageIcon, Settings, LogOut, BookOpen,
} from "lucide-react";
import { logout } from "../_actions/auth";

type NavLink = { href: string; label: string; icon: any; countKey?: string };
type NavDivider = { divider: true; label: string };
type NavItem = NavLink | NavDivider;

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { divider: true, label: "CONTENT" },
  { href: "/services", label: "Services", icon: FileText, countKey: "services" },
  { href: "/doctors", label: "Doctors", icon: Stethoscope, countKey: "doctors" },
  { href: "/equipment", label: "Equipment", icon: Cpu, countKey: "equipment" },
  { href: "/pages", label: "Pages", icon: StickyNote },
  { href: "/blog", label: "Blog", icon: BookOpen },
  { divider: true, label: "OPERATIONS" },
  { href: "/forms", label: "Forms", icon: MessageSquare, countKey: "forms" },
  { href: "/media", label: "Media", icon: ImageIcon },
];

interface SidebarProps {
  userName: string;
  counts?: Record<string, number>;
}

export default function Sidebar({ userName, counts = {} }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-ink flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="font-heading text-champagne text-lg tracking-tight">GENEVITY</span>
          <span className="text-[10px] font-medium text-main-lighter bg-main/20 px-1.5 py-0.5 rounded">CMS</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {navItems.map((item, i) => {
          if ("divider" in item) {
            return (
              <p key={i} className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.15em] px-2 pt-5 pb-2">
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
                  : "text-white/60 hover:text-champagne hover:bg-white/5"
              }`}
            >
              <Icon size={18} className={isActive ? "text-main" : "text-white/40 group-hover:text-white/60"} />
              <span className="flex-1">{item.label}</span>
              {count !== undefined && count > 0 && (
                <span className={`text-[11px] min-w-[20px] text-center rounded-full px-1.5 py-0.5 ${
                  link.countKey === "forms" ? "bg-error/20 text-error" : "bg-white/10 text-white/50"
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
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
            pathname?.startsWith("/settings")
              ? "bg-main/20 text-champagne"
              : "text-white/60 hover:text-champagne hover:bg-white/5"
          }`}
        >
          <Settings size={18} className="text-white/40" />
          <span>Settings</span>
        </Link>
      </div>

      <div className="border-t border-white/10 px-3 py-3">
        <div className="flex items-center justify-between px-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-main/30 flex items-center justify-center text-champagne text-xs font-medium">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-white/70 truncate max-w-[120px]">{userName}</span>
          </div>
          <form action={logout}>
            <button type="submit" className="text-white/30 hover:text-white/60 transition-colors cursor-pointer" title="Вийти">
              <LogOut size={16} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
