import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { first } from "@/lib/utils";

export default async function OwnerHome() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const { data: venues } = await supabase.from("venues").select("id, name, address, is_active, is_promoted, qris_image_url, photo_urls, districts(name), courts(id)").eq("owner_id", profile!.id).order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Venue saya</h1>
        <Link href="/owner/venues/new" className="rounded bg-brand-600 px-4 py-2 text-white hover:bg-brand-700">
          + Tambah venue
        </Link>
      </div>

      {!venues || venues.length === 0 ? (
        <p className="mt-8 rounded border border-dashed bg-white p-8 text-center text-slate-500">Belum ada venue. Klik &ldquo;Tambah venue&rdquo; untuk memulai.</p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {venues.map((v) => (
            <li key={v.id} className="overflow-hidden rounded-lg border bg-white">
              {v.photo_urls?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={v.photo_urls[0]} alt={v.name} className="h-40 w-full object-cover" />
              ) : (
                <div className="flex h-40 items-center justify-center bg-brand-50 text-sm text-brand-700">Belum ada foto</div>
              )}
              <div className="space-y-2 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-slate-800">{v.name}</h2>
                  {!v.is_active && <span className="rounded bg-slate-200 px-2 py-0.5 text-xs">Nonaktif</span>}
                  {v.is_promoted && <span className="rounded bg-accent-50 px-2 py-0.5 text-xs text-accent-600">Promoted</span>}
                </div>
                <p className="text-sm text-slate-600">
                  {first(v.districts)?.name} &middot; {v.address}
                </p>
                <p className="text-sm text-slate-600">{v.courts?.length ?? 0} lapangan</p>
                {!v.qris_image_url && <p className="rounded bg-amber-50 px-2 py-1 text-xs text-amber-800">QRIS belum diunggah. Venue ini belum bisa dibooking.</p>}
                {(v.courts?.length ?? 0) === 0 && <p className="rounded bg-amber-50 px-2 py-1 text-xs text-amber-800">Belum ada lapangan.</p>}
                <div className="flex gap-3 pt-1 text-sm">
                  <Link href={`/owner/venues/${v.id}/edit`} className="text-brand-600 underline">
                    Edit venue
                  </Link>
                  <Link href={`/owner/venues/${v.id}/courts`} className="text-brand-600 underline">
                    Kelola lapangan
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
