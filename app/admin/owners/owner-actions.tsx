"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/button";

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
      <div className="flex gap-2">
        <Button type="button" variant="success" size="sm" onClick={approve} disabled={busy}>
          Setujui
        </Button>
        <Button type="button" variant="outlineDanger" size="sm" onClick={reject} disabled={busy}>
          Tolak
        </Button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
