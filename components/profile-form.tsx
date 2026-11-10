"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileState } from "@/app/profile/actions";
import Button from "@/components/ui/button";
import Field from "@/components/ui/field";
import Input from "@/components/ui/input";
import Notice from "@/components/ui/notice";

export default function ProfileForm({ fullName, phone, email }: { fullName: string; phone: string; email: string }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(updateProfile, {});

  return (
    <form action={action} className="mt-6 space-y-4 rounded-xl border bg-white p-6 shadow-sm">
      <Field label="Email" htmlFor="email" hint="Email tidak bisa diubah.">
        <Input id="email" defaultValue={email} disabled />
      </Field>
      <Field label="Nama lengkap" htmlFor="full_name">
        <Input id="full_name" name="full_name" defaultValue={fullName} autoComplete="name" required />
      </Field>
      <Field label="Nomor HP" htmlFor="phone">
        <Input id="phone" name="phone" type="tel" defaultValue={phone} autoComplete="tel" placeholder="081234567890" />
      </Field>

      {state.error && <Notice tone="error">{state.error}</Notice>}
      {state.success && <Notice tone="success">Profil berhasil disimpan</Notice>}

      <Button disabled={pending}>{pending ? "Menyimpan..." : "Simpan perubahan"}</Button>
    </form>
  );
}
