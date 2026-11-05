import Link from "next/link";
import { logout } from "@/app/login/actions";
import { getCurrentProfile } from "@/lib/auth";
import NotificationBellLoader from "@/components/notification-bell-loader";

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <nav className="flex items-center gap-6">
            <Link href="/" className="font-bold text-brand-700">
              SportMatch
            </Link>
            <Link href="/owner" className="text-sm text-slate-700 hover:text-brand-600">
              Venue saya
            </Link>
            <Link href="/owner/bookings" className="text-sm text-slate-700 hover:text-brand-600">
              Booking masuk
            </Link>
          </nav>
          <div className="flex items-center gap-3 text-sm">
            {profile && <NotificationBellLoader userId={profile.id} />}
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
