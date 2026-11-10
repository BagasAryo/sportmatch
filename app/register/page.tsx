import Link from "next/link";
import { register } from "./actions";
import AuthShell from "@/components/auth-shell";
import Button from "@/components/ui/button";
import Field from "@/components/ui/field";
import Input from "@/components/ui/input";
import Notice from "@/components/ui/notice";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Daftar" };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string; as?: string }> }) {
  const { error, as } = await searchParams;
  const asOwner = as === "owner";

  return (
    <AuthShell title={asOwner ? "Daftar sebagai pemilik venue" : "Buat akun"} subtitle={asOwner ? "Akun pemilik diverifikasi admin sebelum bisa menambah venue." : "Daftar untuk mulai booking lapangan."}>
      {error && (
        <Notice tone="error" className="mb-3">
          {error}
        </Notice>
      )}

      <form action={register} className="space-y-3">
        <Field label="Nama lengkap" htmlFor="full_name">
          <Input id="full_name" name="full_name" autoComplete="name" required />
        </Field>
        <Field label="Nomor HP" htmlFor="phone">
          <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="081234567890" />
        </Field>
        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        <Field label="Kata sandi" htmlFor="password">
          <Input id="password" name="password" type="password" minLength={6} autoComplete="new-password" placeholder="Minimal 6 karakter" required />
        </Field>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="owner_requested" defaultChecked={asOwner} className="h-4 w-4 accent-brand-600" />
          <span>Saya pemilik venue (perlu persetujuan admin)</span>
        </label>

        <Button full>Daftar</Button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-medium text-brand-600 hover:underline">
          Masuk
        </Link>
      </p>
    </AuthShell>
  );
}
