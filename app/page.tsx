import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import { logout } from "@/app/login/actions";

export default async function Home() {
  const profile = await getCurrentProfile();

  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="text-3xl font-bold">SportMatch</h1>
      <p className="mt-1 text-gray-600">Temukan. Bandingkan. Booking.</p>

      {profile ? (
        <div className="mt-6 space-y-3">
          <p>
            Halo, <strong>{profile.full_name}</strong> (peran: {profile.role})
          </p>
          <form action={logout}>
            <button className="rounded bg-gray-800 px-4 py-2 text-white">Keluar</button>
          </form>
        </div>
      ) : (
        <div className="mt-6 flex gap-3">
          <Link href="/login" className="rounded bg-blue-700 px-4 py-2 text-white">
            Masuk
          </Link>
          <Link href="/register" className="rounded border px-4 py-2">
            Daftar
          </Link>
        </div>
      )}
    </main>
  );
}
