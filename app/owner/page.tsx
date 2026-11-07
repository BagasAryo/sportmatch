import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";

export default async function OwnerHome() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const { data: venues } = await supabase.from("venues").select("id, name, address, is_active, is_promoted, qris_image_url, photo_urls, courts(id)").eq("owner_id", profile!.id).order("created_at", { ascending: false });

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
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-4">
          {venues.map((v) => (
            <li key={v.id} className="flex flex-col overflow-hidden rounded-lg border bg-white transition hover:shadow-sm">
              {/* Bingkai foto dengan aspect-4/3 dan badge di kanan atas */}
              <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100">
                {v.photo_urls?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v.photo_urls[0]} alt={v.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-brand-50 text-xs text-brand-700">Belum ada foto</div>
                )}

                <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                  {v.is_promoted && <span className="rounded-md bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-accent-600 shadow-sm">Promoted</span>}
                  {!v.is_active && <span className="rounded-md bg-slate-800/80 px-2 py-0.5 text-[11px] font-medium text-white shadow-sm backdrop-blur-xs">Nonaktif</span>}
                </div>
              </div>

              {/* Info bawah lebih padat, rapi, dan teratur */}
              <div className="flex flex-1 flex-col justify-between p-3">
                <div className="space-y-1">
                  <h2 className="truncate text-sm font-semibold text-slate-800 sm:text-base">{v.name}</h2>
                  <p className="truncate text-xs text-slate-500">{v.address}</p>
                  <p className="text-xs font-medium text-slate-600">{v.courts?.length ?? 0} lapangan</p>

                  {!v.qris_image_url && <p className="mt-1 rounded bg-amber-50 px-2 py-1 text-[11px] text-amber-800">QRIS belum diunggah. Venue belum bisa dibooking.</p>}
                  {(v.courts?.length ?? 0) === 0 && <p className="mt-1 rounded bg-amber-50 px-2 py-1 text-[11px] text-amber-800">Belum ada lapangan.</p>}
                </div>

                <div className="mt-3 flex gap-3 border-t pt-2 text-xs font-medium">
                  <Link href={`/owner/venues/${v.id}/edit`} className="text-brand-600 hover:underline">
                    Edit venue
                  </Link>
                  <Link href={`/owner/venues/${v.id}/courts`} className="text-brand-600 hover:underline">
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
