import Link from "next/link";
import SiteHeader from "@/components/site-header";
import StatusBadge from "@/components/status-badge";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { first } from "@/lib/utils";
import { formatDateID, rupiah } from "@/lib/format";

export default async function MyBookingsPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, booking_date, start_time, end_time, total_price, status, rejection_note, created_at, courts(name, sport_types(name), venues(name))")
    .eq("user_id", profile!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-800">Booking saya</h1>

        {!bookings || bookings.length === 0 ? (
          <p className="mt-6 rounded border border-dashed bg-white p-8 text-center text-slate-500">
            Belum ada booking.{" "}
            <Link href="/" className="text-brand-600 underline">
              Cari venue
            </Link>
          </p>
        ) : (
          <ul className="mt-6 space-y-3">
            {bookings.map((b) => {
              const court = first(b.courts);
              const venue = first(court?.venues);
              const needsAction = b.status === "menunggu_bayar" || b.status === "menunggu_verifikasi";
              return (
                <li key={b.id} className="rounded-lg border bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-800">{venue?.name}</p>
                      <p className="text-sm text-slate-600">
                        {court?.name} &middot; {first(court?.sport_types)?.name}
                      </p>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {formatDateID(b.booking_date)} &middot; {b.start_time.slice(0, 5)} - {b.end_time.slice(0, 5)}
                  </p>
                  <p className="text-sm font-medium text-brand-700">{rupiah(b.total_price)}</p>
                  {b.status === "ditolak" && b.rejection_note && <p className="mt-2 rounded bg-red-50 px-3 py-1.5 text-sm text-red-800">Alasan penolakan: {b.rejection_note}</p>}
                  
                    <Link
                      href={`/bookings/${b.id}`}
                      className={needsAction ? "mt-3 inline-block rounded bg-accent-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-accent-600" : "mt-3 inline-block rounded border px-4 py-1.5 text-sm hover:bg-slate-100"}
                    >
                      {b.status === "menunggu_bayar" ? "Lanjutkan pembayaran" : b.status === "menunggu_verifikasi" ? "Lihat status" : "Lihat detail"}
                    </Link>
                  
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
