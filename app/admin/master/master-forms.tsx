"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

function useSubmit() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function run(action: () => PromiseLike<{ error: { message: string } | null }>, success: string) {
    setBusy(true);
    setError("");
    setOk("");
    const { error: dbErr } = await action();
    setBusy(false);
    if (dbErr) return setError(dbErr.message);
    setOk(success);
    router.refresh();
  }
  return { busy, error, ok, run };
}

function Feedback({ error, ok }: { error: string; ok: string }) {
  return (
    <>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {ok && <p className="mt-2 text-xs text-green-700">{ok}</p>}
    </>
  );
}

export function AddSportForm() {
  const supabase = createClient();
  const [name, setName] = useState("");
  const { busy, error, ok, run } = useSubmit();

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await run(() => supabase.from("sport_types").insert({ name: name.trim() }), "Jenis olahraga ditambahkan");
        setName("");
      }}
    >
      <div className="flex gap-2">
        <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jenis olahraga baru" aria-label="Jenis olahraga baru" />
        <Button disabled={busy}>Tambah</Button>
      </div>
      <Feedback error={error} ok={ok} />
    </form>
  );
}

export function ServiceFeeForm({ initial }: { initial: number }) {
  const supabase = createClient();
  const [value, setValue] = useState(String(initial));
  const { busy, error, ok, run } = useSubmit();

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const n = Number(value);
        if (!Number.isInteger(n) || n < 0) return;
        await run(() => supabase.from("app_settings").update({ value: n }).eq("key", "service_fee"), "Biaya layanan diperbarui. Berlaku untuk booking baru.");
      }}
    >
      <div className="flex gap-2">
        <Input type="number" min={0} step={1} required value={value} onChange={(e) => setValue(e.target.value)} aria-label="Biaya layanan (Rp)" />
        <Button disabled={busy}>Simpan</Button>
      </div>
      <Feedback error={error} ok={ok} />
    </form>
  );
}
