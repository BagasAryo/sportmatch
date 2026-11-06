"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function OwnerActions({ userId }: { userId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function approve() {
    setBusy(true);
    setError("");
    const { error: dbErr } = await supabase.from("profiles").update({ role: "owner" }).eq("id", userId);
    setBusy(false);
    if (dbErr) return setError(dbErr.message);
    router.refresh();
  }

  async function reject() {
    if (!confirm("Tolak pengajuan ini?")) return;
    setBusy(true);
    setError("");
    const { error: dbErr } = await supabase.from("profiles").update({ owner_requested: false }).eq("id", userId);
    setBusy(false);
    if (dbErr) return setError(dbErr.message);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2 text-sm">
        <button onClick={approve} disabled={busy} className="rounded bg-green-600 px-3 py-1.5 text-white hover:bg-green-700 disabled:opacity-60">
          Setujui
        </button>
        <button onClick={reject} disabled={busy} className="rounded border border-red-300 px-3 py-1.5 text-red-700 hover:bg-red-50 disabled:opacity-60">
          Tolak
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
