"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/button";

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
      <div className="flex gap-2">
        <Button type="button" variant={isPromoted ? "accent" : "outline"} size="sm" onClick={() => update({ is_promoted: !isPromoted })} disabled={busy}>
          {isPromoted ? "Promoted: aktif" : "Jadikan promoted"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => update({ is_active: !isActive })} disabled={busy}>
          {isActive ? "Nonaktifkan" : "Aktifkan"}
        </Button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
