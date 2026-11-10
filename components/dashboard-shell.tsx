import Link from "next/link";
import { getCurrentProfile, type Role } from "@/lib/auth";
import NotificationBellLoader from "@/components/notification-bell-loader";
import UserMenu from "@/components/user-menu";
import DashboardNav, { type NavItem } from "@/components/dashboard-nav";

const ROLE_LABEL: Record<Role, string> = {
  user: "Pengguna",
  owner: "Pemilik venue",
  admin: "Admin",
};

const NAV: Record<"owner" | "admin", NavItem[]> = {
  owner: [
    { href: "/owner", label: "Venue saya", exact: true, also: ["/owner/venues"] },
    { href: "/owner/bookings", label: "Booking masuk" },
  ],
  admin: [
    { href: "/admin", label: "Ringkasan", exact: true },
    { href: "/admin/owners", label: "Pemilik venue" },
    { href: "/admin/venues", label: "Venue" },
    { href: "/admin/bookings", label: "Booking" },
    { href: "/admin/master", label: "Data master" },
  ],
};

export default async function DashboardShell({ role, children }: { role: "owner" | "admin"; children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  const home = role === "admin" ? "/admin" : "/owner";
  const dashboard = profile?.role === "admin" ? { href: "/admin", label: "Dashboard admin" } : { href: "/owner", label: "Venue saya" };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href={home} className="text-lg font-bold text-brand-700">
              SportMatch
            </Link>
            <span className="hidden rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 sm:inline">{role === "admin" ? "Admin" : "Pemilik venue"}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifikasi tidak pernah dikirim ke admin */}
            {profile && profile.role !== "admin" && <NotificationBellLoader userId={profile.id} />}
            {profile && <UserMenu name={profile.full_name} roleLabel={ROLE_LABEL[profile.role]} items={[dashboard, { href: "/profile", label: "Edit profil" }]} />}
          </div>
        </div>
        <div className="border-b">
          <DashboardNav items={NAV[role]} />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
