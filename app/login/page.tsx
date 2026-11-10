import Link from "next/link";
import { login } from "./actions";
import AuthShell from "@/components/auth-shell";
import Button from "@/components/ui/button";
import Field from "@/components/ui/field";
import Input from "@/components/ui/input";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Masuk" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const { error, next } = await searchParams;

  return (
    <AuthShell title="Masuk" subtitle="Masuk untuk melihat booking dan mengelola akunmu.">
      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}

      <form action={login} className="space-y-4">
        <input type="hidden" name="next" value={next ?? "/"} />
        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        <Field label="Kata sandi" htmlFor="password">
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
        </Field>
        <Button full>Masuk</Button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-600">
        Belum punya akun?{" "}
        <Link href="/register" className="font-medium text-brand-600 hover:underline">
          Daftar
        </Link>
      </p>
    </AuthShell>
  );
}
