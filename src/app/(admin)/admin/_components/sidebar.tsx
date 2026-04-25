"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, Stethoscope, Cpu,
  StickyNote, MessageSquare, Image as ImageIcon, Settings, LogOut,
  BookOpen, DollarSign, Users, ScrollText, ShieldCheck,
} from "lucide-react";
import { logout } from "../_actions/auth";
import Button from "@/components/ui/Button";

type Role = "admin" | "marketing" | "support";

type NavLink = {
  href: string;
  label: string;
  icon: any;
  countKey?: string;
  minRole?: Role;
};
type NavDivider = { divider: true; label: string; minRole?: Role };
type NavItem = NavLink | NavDivider;

// Role hierarchy: admin > marketing > support
const ROLE_LEVEL: Record<Role, number> = { admin: 3, marketing: 2, support: 1 };

function canSee(item: { minRole?: Role }, role: Role): boolean {
  if (!item.minRole) return true;
  return ROLE_LEVEL[role] >= ROLE_LEVEL[item.minRole];
}

const navItems: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, minRole: "support" },
  { divider: true, label: "CONTENT", minRole: "marketing" },
  { href: "/admin/pages", label: "Pages", icon: StickyNote, minRole: "marketing" },
  { href: "/admin/services", label: "Services", icon: FileText, countKey: "services", minRole: "marketing" },
  { href: "/admin/doctors", label: "Doctors", icon: Stethoscope, countKey: "doctors", minRole: "marketing" },
  { href: "/admin/equipment", label: "Equipment", icon: Cpu, countKey: "equipment", minRole: "marketing" },
  { href: "/admin/pricing", label: "Pricing", icon: DollarSign, minRole: "marketing" },
  { href: "/admin/blog", label: "Blog", icon: BookOpen, minRole: "marketing" },
  { divider: true, label: "OPERATIONS", minRole: "support" },
  { href: "/admin/forms", label: "Forms", icon: MessageSquare, countKey: "forms", minRole: "support" },
  { href: "/admin/media", label: "Media", icon: ImageIcon, minRole: "marketing" },
];

const superItems: NavItem[] = [
  { divider: true, label: "ADMIN", minRole: "admin" },
  { href: "/admin/super/users", label: "Users", icon: Users, minRole: "admin" },
  { href: "/admin/super/logs", label: "Change Log", icon: ScrollText, minRole: "admin" },
];

interface SidebarProps {
  userName: string;
  role: string;
  counts?: Record<string, number>;
}

export default function Sidebar({ userName, role, counts = {} }: SidebarProps) {
  const pathname = usePathname();
  const userRole = (role as Role) || "support";
  const isSettingsActive = pathname?.startsWith("/admin/settings") ?? false;

  function NavRow({ item }: { item: NavItem }) {
    if ("divider" in item) {
      if (!canSee(item, userRole)) return null;
      return (
        <p className="text-[10px] font-semibold text-muted uppercase tracking-[0.15em] px-2 pt-5 pb-2">
          {item.label}
        </p>
      );
    }
    if (!canSee(item, userRole)) return null;
    const Icon = item.icon;
    const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
    const count = item.countKey ? counts[item.countKey] : undefined;
    return (
      <Link
        href={item.href}
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
            item.countKey === "forms" ? "bg-error/20 text-error" : "bg-white/10 text-champagne/60"
          }`}>
            {count}
          </span>
        )}
      </Link>
    );
  }

  return (
    <aside className="m-2 fixed left-0 top-0 bottom-0 w-60 bg-ink rounded-3xl flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Image src="/brand/LogoFullLight.svg" alt="GENEVITY" width={180} height={40} className="h-8 w-auto" priority />
          <span className="text-[10px] font-medium text-champagne bg-main/20 px-1.5 py-0.5 rounded">CMS</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {navItems.map((item, i) => <NavRow key={i} item={item} />)}
        {userRole === "admin" && superItems.map((item, i) => <NavRow key={`s${i}`} item={item} />)}
      </nav>

      {/* Settings */}
      {canSee({ minRole: "marketing" }, userRole) && (
        <div className="border-t border-white/10 px-3 py-2">
          <Link
            href="/admin/settings"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              isSettingsActive
                ? "bg-main/20 text-champagne"
                : "text-champagne/50 hover:text-champagne/80 hover:bg-champagne/10"
            }`}
          >
            <Settings size={18} className={isSettingsActive ? "text-champagne" : "text-champagne/80"} />
            <span>Settings</span>
          </Link>
        </div>
      )}

      {/* User */}
      <div className="border-t border-white/10 px-3 py-3">
        <div className="flex items-center justify-between gap-2 pl-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-main/30 flex items-center justify-center text-champagne text-xs font-medium shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <span className="text-sm text-champagne/80 truncate block">{userName}</span>
              <span className="text-[10px] text-champagne/40 capitalize">{role}</span>
            </div>
          </div>
          <form action={logout}>
            <Button variant="outline-light" icon size="sm" type="submit" title="Log out" ariaLabel="Log out">
              <LogOut size={14} />
            </Button>
          </form>
        </div>
      </div>
    </aside>
  );
}
