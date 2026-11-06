"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function VenueToggles({ venueId, isPromoted, isActive }: { venueId: string; isPromoted: boolean; isActive: boolean }) {
  const router = useRouter();
  const supabase = createClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function update(patch: { is_promoted?: boolean; is_active?: boolean }) {
    setBusy(true);
    setError("");
    const { error: dbErr } = await supabase.from("venues").update(patch).eq("id", venueId);
    setBusy(false);
    if (dbErr) return setError(dbErr.message);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2 text-sm">
        <button onClick={() => update({ is_promoted: !isPromoted })} disabled={busy} className={`rounded px-3 py-1.5 disabled:opacity-60 ${isPromoted ? "bg-accent-500 text-white hover:bg-accent-600" : "border hover:bg-slate-100"}`}>
          {isPromoted ? "Promoted: aktif" : "Jadikan promoted"}
        </button>
        <button onClick={() => update({ is_active: !isActive })} disabled={busy} className="rounded border px-3 py-1.5 hover:bg-slate-100 disabled:opacity-60">
          {isActive ? "Nonaktifkan" : "Aktifkan"}
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
