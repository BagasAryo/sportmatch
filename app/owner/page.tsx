import Link from "next/link";
import { buttonClass } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";

export default async function OwnerHome() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const [{ data: venues }, { count: pendingCount }] = await Promise.all([
    supabase.from("venues").select("id, name, address, is_active, is_promoted, qris_image_url, photo_urls, courts(id)").eq("owner_id", profile!.id).order("created_at", { ascending: false }),
    supabase.from("bookings").select("id, courts!inner(venues!inner(owner_id))", { count: "exact", head: true }).eq("status", "menunggu_verifikasi").eq("courts.venues.owner_id", profile!.id),
  ]);

  const list = venues ?? [];
  const pending = pendingCount ?? 0;
  const notReady = list.filter((v) => !v.qris_image_url || (v.courts?.length ?? 0) === 0).length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">Venue saya</h1>
        <Link href="/owner/venues/new" className={buttonClass("primary")}>
          + Tambah venue
        </Link>
      </div>

      <ul className="mt-5 grid gap-3 sm:grid-cols-3">
        <li>
          <Link href="/owner/bookings" className={`block rounded-xl border p-4 shadow-sm hover:border-brand-600 ${pending > 0 ? "border-accent-500 bg-accent-50" : "bg-white"}`}>
            <p className="text-sm text-slate-600">Menunggu verifikasi</p>
            <p className={`mt-1 text-2xl font-bold ${pending > 0 ? "text-accent-600" : "text-slate-800"}`}>{pending}</p>
            {pending > 0 && <p className="mt-1 text-xs text-accent-600">Buka booking masuk &rarr;</p>}
          </Link>
        </li>
        <li className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-600">Jumlah venue</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{list.length}</p>
        </li>
        <li className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-600">Belum bisa dibooking</p>
          <p className={`mt-1 text-2xl font-bold ${notReady > 0 ? "text-accent-600" : "text-slate-800"}`}>{notReady}</p>
          {notReady > 0 && <p className="mt-1 text-xs text-slate-500">QRIS atau lapangan belum lengkap</p>}
        </li>
      </ul>

      {list.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed bg-white p-8 text-center text-slate-500">Belum ada venue. Klik &ldquo;Tambah venue&rdquo; untuk memulai.</div>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-4">
          {list.map((v) => (
            <li key={v.id} className="flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md">
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

              <div className="flex flex-1 flex-col justify-between p-3">
                <div className="space-y-1">
                  <h2 className="truncate text-sm font-semibold text-slate-800 sm:text-base">{v.name}</h2>
                  <p className="truncate text-xs text-slate-500">{v.address}</p>
                  <p className="text-xs font-medium text-slate-600">{v.courts?.length ?? 0} lapangan</p>

                  {!v.qris_image_url && <p className="mt-1 rounded-lg bg-accent-50 px-2 py-1 text-[11px] text-accent-600">QRIS belum diunggah. Venue belum bisa dibooking.</p>}
                  {(v.courts?.length ?? 0) === 0 && <p className="mt-1 rounded-lg bg-accent-50 px-2 py-1 text-[11px] text-accent-600">Belum ada lapangan.</p>}
                </div>

                <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t pt-2 text-xs font-medium">
                  <Link href={`/owner/venues/${v.id}/edit`} className="text-brand-600 hover:underline">
                    Edit venue
                  </Link>
                  <Link href={`/owner/venues/${v.id}/courts`} className="text-brand-600 hover:underline">
                    Kelola lapangan
                  </Link>
                  <Link href={`/venues/${v.id}`} className="text-slate-500 hover:underline">
                    Lihat
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
