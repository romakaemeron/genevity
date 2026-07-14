"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, FileText, Stethoscope, Cpu,
  StickyNote, MessageSquare, Image as ImageIcon, Settings, LogOut,
  BookOpen, DollarSign, Users, ScrollText, Star, BarChart2, HelpCircle,
} from "lucide-react";
import { logout } from "../_actions/auth";
import Button from "@/components/ui/Button";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuBadge, SidebarMenuButton,
  SidebarMenuItem, SidebarProvider,
} from "@/components/ui/sidebar";
import { useAdminLocale } from "../_i18n/context";
import LocaleSelector from "./locale-selector";

type Role = "admin" | "marketing" | "support";

const ROLE_LEVEL: Record<Role, number> = { admin: 3, marketing: 2, support: 1 };
function canSee(item: { minRole?: Role }, role: Role) {
  return !item.minRole || ROLE_LEVEL[role] >= ROLE_LEVEL[item.minRole];
}

type NavItemDef = {
  key: string;
  href: string;
  icon: React.ElementType;
  countKey?: string;
  minRole?: Role;
};

type NavSectionDef = {
  sectionKey?: string;
  items: NavItemDef[];
};

const navSections: NavSectionDef[] = [
  {
    items: [
      { key: "dashboard", href: "/admin/dashboard", icon: LayoutDashboard, minRole: "support" },
    ],
  },
  {
    sectionKey: "operations",
    items: [
      { key: "forms",     href: "/admin/forms",     icon: MessageSquare, countKey: "forms",    minRole: "support" },
      { key: "chats",     href: "/admin/chats",     icon: MessageSquare,                        minRole: "support" },
      { key: "reviews",   href: "/admin/reviews",   icon: Star,          countKey: "reviews",  minRole: "support" },
      { key: "analytics", href: "/admin/analytics", icon: BarChart2,                           minRole: "marketing" },
    ],
  },
  {
    sectionKey: "content",
    items: [
      { key: "services",  href: "/admin/services",  icon: FileText,  countKey: "services",  minRole: "marketing" },
      { key: "doctors",   href: "/admin/doctors",   icon: Stethoscope, countKey: "doctors", minRole: "marketing" },
      { key: "equipment", href: "/admin/equipment", icon: Cpu,       countKey: "equipment", minRole: "marketing" },
      { key: "blog",      href: "/admin/blog",      icon: BookOpen,                          minRole: "marketing" },
      { key: "pricing",   href: "/admin/pricing",   icon: DollarSign,                        minRole: "marketing" },
      { key: "faq",       href: "/admin/faq",       icon: HelpCircle,                        minRole: "marketing" },
    ],
  },
  {
    sectionKey: "website",
    items: [
      { key: "settings",  href: "/admin/settings",  icon: Settings,   minRole: "marketing" },
      { key: "pages",     href: "/admin/pages",     icon: StickyNote, minRole: "marketing" },
      { key: "media",     href: "/admin/media",     icon: ImageIcon,  minRole: "marketing" },
    ],
  },
  {
    sectionKey: "admin",
    items: [
      { key: "users", href: "/admin/super/users", icon: Users,      minRole: "admin" },
      { key: "logs",  href: "/admin/super/logs",  icon: ScrollText, minRole: "admin" },
    ],
  },
];

interface Props {
  userName: string;
  role: string;
  counts?: Record<string, number>;
}

export default function AdminSidebar({ userName, role, counts = {} }: Props) {
  const pathname = usePathname();
  const { t } = useAdminLocale();
  const userRole = (role as Role) || "support";

  const visibleSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => canSee(item, userRole)),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <Sidebar variant="floating" collapsible="offcanvas">
      {/* Logo */}
      <SidebarHeader className="px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <Image
            src="/brand/LogoFullLight.svg"
            alt="GENEVITY"
            width={160}
            height={36}
            className="h-7 w-auto"
            priority
          />
          <span className="text-[10px] font-medium text-sidebar-foreground/60 bg-sidebar-foreground/10 px-1.5 py-0.5 rounded shrink-0">
            CMS
          </span>
        </div>
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent className="py-1 gap-0">
        {visibleSections.map((section) => (
          <SidebarGroup key={section.sectionKey ?? "root"} className="py-0 px-2">
            {section.sectionKey && (
              <SidebarGroupLabel className="text-[9px] font-semibold tracking-[0.18em] text-sidebar-foreground/35 uppercase h-6 px-2 mt-1">
                {t.nav.sections[section.sectionKey as keyof typeof t.nav.sections]}
              </SidebarGroupLabel>
            )}
            <SidebarMenu className="gap-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                const count = item.countKey ? counts[item.countKey] : undefined;
                const label = t.nav.items[item.key as keyof typeof t.nav.items];
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      tooltip={label}
                      className={cn(
                        "gap-2.5 transition-opacity duration-100",
                        !isActive && "opacity-50 hover:opacity-75",
                      )}
                    >
                      <Icon size={15} className="shrink-0" />
                      <span className="truncate">{label}</span>
                    </SidebarMenuButton>
                    {count !== undefined && count > 0 && (
                      <SidebarMenuBadge
                        className={
                          item.countKey === "forms"
                            ? "bg-destructive/15 text-destructive text-[10px]"
                            : "bg-sidebar-foreground/10 text-sidebar-foreground/50 text-[10px]"
                        }
                      >
                        {count}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer: locale selector + user info */}
      <SidebarFooter className="border-t border-sidebar-border px-2 py-2 gap-1">
        <LocaleSelector />

        <div className="flex items-center justify-between gap-2 px-1 py-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-sidebar-primary/25 flex items-center justify-center text-sidebar-foreground text-xs font-semibold shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm text-sidebar-foreground/80 truncate leading-tight">{userName}</p>
              <p className="text-[10px] text-sidebar-foreground/40 capitalize leading-tight">{role}</p>
            </div>
          </div>
          <form action={logout}>
            <Button variant="outline-light" icon size="sm" type="submit" title={t.common.logout} ariaLabel={t.common.logout}>
              <LogOut size={14} />
            </Button>
          </form>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export { SidebarProvider };
