import Link from "next/link";
import { logout } from "@/app/login/actions";
import { getCurrentProfile } from "@/lib/auth";

const NAV = [
  { href: "/admin", label: "Ringkasan" },
  { href: "/admin/owners", label: "Pemilik venue" },
  { href: "/admin/venues", label: "Venue" },
  { href: "/admin/bookings", label: "Booking" },
  { href: "/admin/master", label: "Data master" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <Link href="/" className="font-bold text-brand-700">
              SportMatch
            </Link>
            <span className="rounded bg-accent-50 px-2 py-0.5 text-xs font-medium text-accent-600">Admin</span>
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="text-sm text-slate-700 hover:text-brand-600">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-600">{profile?.full_name}</span>
            <form action={logout}>
              <button className="rounded border px-3 py-1 hover:bg-slate-100">Keluar</button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-6">{children}</div>
    </div>
  );
}
