"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = {
  href: string;
  label: string;
  exact?: boolean; // hanya aktif di href ini, bukan di halaman turunannya
  also?: string[]; // awalan path lain yang ikut menandai menu ini aktif
};

export default function DashboardNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Menu dashboard" className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4">
      {items.map((item) => {
        const active = pathname === item.href || (item.also ?? []).some((p) => pathname.startsWith(p)) || (!item.exact && pathname.startsWith(item.href + "/"));
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium ${active ? "border-brand-600 text-brand-700" : "border-transparent text-slate-600 hover:text-brand-600"}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
