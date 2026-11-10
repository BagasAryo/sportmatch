import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { first } from "@/lib/utils";
import VenueToggles from "./venue-toggles";

export default async function AdminVenuesPage() {
  const supabase = await createClient();

  const { data: venues } = await supabase.from("venues").select("id, name, address, is_active, is_promoted, qris_image_url, created_at, profiles(full_name), courts(id)").order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-800">Venue</h1>
      <p className="mt-1 text-sm text-slate-600">Venue promoted tampil di urutan atas hasil pencarian dengan badge Promoted.</p>

      {!venues || venues.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed bg-white p-8 text-center text-slate-500">Belum ada venue.</div>
      ) : (
        <ul className="mt-6 space-y-3">
          {venues.map((v) => (
            <li key={v.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-4 shadow-sm">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/venues/${v.id}`} className="font-semibold text-slate-800 hover:text-brand-600">
                    {v.name}
                  </Link>
                  {v.is_promoted && <span className="rounded-full bg-accent-50 px-2.5 py-0.5 text-xs font-medium text-accent-600">Promoted</span>}
                  {!v.is_active && <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-700">Nonaktif</span>}
                </div>
                <p className="text-sm text-slate-600">
                  Pemilik: {first(v.profiles)?.full_name || "-"} &middot; {v.courts?.length ?? 0} lapangan
                </p>
                {!v.qris_image_url && <p className="text-xs text-accent-600">QRIS belum diunggah</p>}
              </div>
              <VenueToggles venueId={v.id} isPromoted={v.is_promoted} isActive={v.is_active} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
