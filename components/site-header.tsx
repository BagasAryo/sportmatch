import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import { logout } from "@/app/login/actions";
import NotificationBellLoader from "@/components/notification-bell-loader";

export default async function SiteHeader() {
  const profile = await getCurrentProfile();

  const dashHref = profile?.role === "admin" ? "/admin" : profile?.role === "owner" ? "/owner" : "/bookings";
  const dashLabel = profile?.role === "admin" ? "Dashboard admin" : profile?.role === "owner" ? "Venue saya" : "Booking saya";

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-brand-700">
          SportMatch
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {profile ? (
            <>
              <Link href={dashHref} className="text-slate-700 hover:text-brand-600">
                {dashLabel}
              </Link>
              <NotificationBellLoader userId={profile.id} />
              <Link href="/profile" className="hidden text-slate-500 hover:text-brand-600 sm:inline">
                {profile.full_name}
              </Link>
              <form action={logout}>
                <button className="rounded border px-3 py-1 hover:bg-slate-100">Keluar</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-slate-700 hover:text-brand-600">
                Masuk
              </Link>
              <Link href="/register" className="rounded bg-brand-600 px-3 py-1.5 text-white hover:bg-brand-700">
                Daftar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
