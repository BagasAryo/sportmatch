import Link from "next/link";
import { register } from "./actions";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto max-w-sm p-8">
      <h1 className="text-2xl font-bold">Daftar akun SportMatch</h1>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <form action={register} className="mt-6 space-y-4">
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium">
            Nama lengkap
          </label>
          <input id="full_name" name="full_name" required className="mt-1 w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium">
            Nomor HP
          </label>
          <input id="phone" name="phone" type="tel" className="mt-1 w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input id="email" name="email" type="email" required className="mt-1 w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Kata sandi (minimal 6 karakter)
          </label>
          <input id="password" name="password" type="password" minLength={6} required className="mt-1 w-full rounded border px-3 py-2" />
        </div>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="owner_requested" className="mt-1" />
          <span>Saya pemilik/pengelola fasilitas olahraga dan ingin mendaftarkan venue (menunggu persetujuan admin)</span>
        </label>
        <button className="w-full rounded bg-blue-700 px-4 py-2 text-white">Daftar</button>
      </form>

      <p className="mt-4 text-sm">
        Sudah punya akun?{" "}
        <Link href="/login" className="text-blue-700 underline">
          Masuk
        </Link>
      </p>
    </main>
  );
}
