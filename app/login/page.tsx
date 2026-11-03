import Link from "next/link";
import { login } from "./actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const { error, next } = await searchParams;

  return (
    <main className="mx-auto max-w-sm p-8">
      <h1 className="text-2xl font-bold">Masuk ke SportMatch</h1>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <form action={login} className="mt-6 space-y-4">
        <input type="hidden" name="next" value={next ?? "/"} />
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input id="email" name="email" type="email" required className="mt-1 w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Kata sandi
          </label>
          <input id="password" name="password" type="password" required className="mt-1 w-full rounded border px-3 py-2" />
        </div>
        <button className="w-full rounded bg-blue-700 px-4 py-2 text-white">Masuk</button>
      </form>

      <p className="mt-4 text-sm">
        Belum punya akun?{" "}
        <Link href="/register" className="text-blue-700 underline">
          Daftar
        </Link>
      </p>
    </main>
  );
}
