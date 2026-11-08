"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileState } from "@/app/profile/actions";

export default function ProfileForm({ fullName, phone, email }: { fullName: string; phone: string; email: string }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(updateProfile, {});

  return (
    <form action={action} className="mt-6 space-y-4 rounded-lg border bg-white p-5">
      <div>
        <label className="block text-sm font-medium text-slate-700">Email</label>
        <input value={email} disabled className="mt-1 w-full rounded border bg-slate-100 px-3 py-2 text-slate-500" />
      </div>
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-slate-700">
          Nama lengkap
        </label>
        <input id="full_name" name="full_name" defaultValue={fullName} required className="mt-1 w-full rounded border px-3 py-2" />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
          Nomor HP
        </label>
        <input id="phone" name="phone" defaultValue={phone} placeholder="081234567890" className="mt-1 w-full rounded border px-3 py-2" />
      </div>

      {state.error && <p className="rounded bg-red-50 px-3 py-1.5 text-sm text-red-800">{state.error}</p>}
      {state.success && <p className="rounded bg-green-50 px-3 py-1.5 text-sm text-green-800">Profil berhasil disimpan</p>}

      <button disabled={pending} className="rounded bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
        {pending ? "Menyimpan..." : "Simpan perubahan"}
      </button>
    </form>
  );
}
