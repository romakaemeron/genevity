"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAdminLocale } from "../_i18n/context";

function labelFor(segment: string, breadcrumb: Record<string, string>): string {
  if (breadcrumb[segment]) return breadcrumb[segment];
  if (/^[0-9a-f-]{8,}$/.test(segment) || /^\d+$/.test(segment)) return breadcrumb.edit ?? "Edit";
  return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
}

export default function AdminHeader() {
  const pathname = usePathname();
  const { t } = useAdminLocale();

  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (seg === "admin") continue;
    const label = labelFor(seg, t.breadcrumb as Record<string, string>);
    const href = "/" + segments.slice(0, i + 1).join("/");
    crumbs.push({ label, href });
  }

  const visible = crumbs.slice(-3);

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border/50 bg-background px-8">
      <SidebarTrigger className="-ml-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition-transform" />
      <Separator
        orientation="vertical"
        className="mr-1 data-[orientation=vertical]:h-4 data-[orientation=vertical]:self-auto"
      />
      <Breadcrumb>
        <BreadcrumbList>
          {visible.map((crumb, i) => {
            const isLast = i === visible.length - 1;
            return (
              <span key={crumb.href} className="flex items-center gap-1.5">
                {i > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem className={i < visible.length - 1 ? "hidden md:flex" : undefined}>
                  {isLast ? (
                    <BreadcrumbPage className="text-foreground font-medium">{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      render={<Link href={crumb.href} />}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {crumb.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </span>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
