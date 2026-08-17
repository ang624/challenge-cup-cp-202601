"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { BrandIdentity } from "@/components/layout/brand-identity";
import { usePlatform } from "@/contexts/platform-context";
import { navigationGroups, type PageSlug } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function ResearchSidebar({ page }: { page: PageSlug }) {
  const { sidebarCollapsed, setSidebarCollapsed } = usePlatform();
  const search = useSearchParams().toString();
  return (
    <aside className={cn("research-sidebar", sidebarCollapsed && "sidebar-collapsed")}>
      <BrandIdentity collapsed={sidebarCollapsed} />
      <button className="sidebar-toggle" type="button" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} aria-label={sidebarCollapsed ? "展开导航" : "收起导航"}>
        {sidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
      </button>
      <nav aria-label="研究平台导航">
        {navigationGroups.map((group) => (
          <div className="nav-group" key={group.label}>
            {!sidebarCollapsed ? <span className="nav-group-label">{group.label}</span> : null}
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  href={`/${item.slug}${search ? `?${search}` : ""}`}
                  className={cn("nav-item", page === item.slug && "nav-active")}
                  key={item.slug}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon aria-hidden="true" />
                  {!sidebarCollapsed ? <span>{item.label}</span> : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
