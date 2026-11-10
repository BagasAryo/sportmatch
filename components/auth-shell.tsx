import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthShell({ title, subtitle, wide = false, children }: { title: string; subtitle: string; wide?: boolean; children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-brand-600 p-12 text-white lg:flex">
        <Link href="/" className="text-xl font-bold">
          SportMatch
        </Link>
        <div>
          <div className="h-1 w-12 rounded bg-accent-500" />
          <p className="mt-6 max-w-sm text-3xl font-bold leading-tight">Cari lapangan kosong, booking, dan bayar lewat QRIS.</p>
          <p className="mt-3 max-w-sm text-brand-100">Futsal, badminton, dan voli di satu tempat.</p>
        </div>
        <p className="text-sm text-brand-100">&copy; {new Date().getFullYear()} SportMatch</p>
      </aside>

      <main className="flex items-center justify-center bg-slate-50 px-4 py-6">
        <div className={`w-full ${wide ? "max-w-sm" : "max-w-sm"}`}>
          <Link href="/" className="mb-6 block text-lg font-bold text-brand-700 lg:hidden">
            SportMatch
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
          <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm">{children}</div>
        </div>
      </main>
    </div>
  );
}
