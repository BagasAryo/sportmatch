import Link from "next/link";
import { getCurrentProfile, type Role } from "@/lib/auth";
import NotificationBellLoader from "@/components/notification-bell-loader";
import UserMenu from "@/components/user-menu";

const ROLE_LABEL: Record<Role, string> = {
  user: "Pengguna",
  owner: "Pemilik venue",
  admin: "Admin",
};

export default async function SiteHeader() {
  const profile = await getCurrentProfile();

  const dashboard = profile?.role === "admin" ? { href: "/admin", label: "Dashboard admin" } : profile?.role === "owner" ? { href: "/owner", label: "Venue saya" } : { href: "/bookings", label: "Booking saya" };

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-brand-700">
          SportMatch
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          {profile ? (
            <>
              {/* Notifikasi hanya dikirim ke user dan owner, jadi admin tidak perlu lonceng */}
              {profile.role !== "admin" && <NotificationBellLoader userId={profile.id} />}
              <UserMenu name={profile.full_name} roleLabel={ROLE_LABEL[profile.role]} items={[dashboard, { href: "/profile", label: "Edit profil" }]} />
            </>
          ) : (
            <>
              <Link href="/login" className="font-medium text-slate-700 hover:text-brand-600">
                Masuk
              </Link>
              <Link href="/register" className="rounded-full bg-brand-600 px-4 py-1.5 font-medium text-white hover:bg-brand-700">
                Daftar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
