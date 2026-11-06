import StatusBadge from "@/components/status-badge";
import { createClient } from "@/lib/supabase/server";
import { first } from "@/lib/utils";
import { formatDateID, rupiah } from "@/lib/format";

export default async function AdminBookingsPage() {
  const supabase = await createClient();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, booking_date, start_time, end_time, service_fee, total_price, status, created_at, profiles(full_name), courts(name, sport_types(name), venues(name))")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-800">Booking</h1>
      <p className="mt-1 text-sm text-slate-600">100 booking terbaru dari seluruh venue.</p>

      {!bookings || bookings.length === 0 ? (
        <p className="mt-6 rounded border border-dashed bg-white p-8 text-center text-slate-500">Belum ada booking.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {bookings.map((b) => {
            const court = first(b.courts);
            const venue = first(court?.venues);
            return (
              <li key={b.id} className="rounded-lg border bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-800">
                      {venue?.name} &middot; {court?.name} ({first(court?.sport_types)?.name})
                    </p>
                    <p className="text-sm text-slate-600">Pemesan: {first(b.profiles)?.full_name || "-"}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {formatDateID(b.booking_date)} &middot; {b.start_time.slice(0, 5)} - {b.end_time.slice(0, 5)}
                </p>
                <p className="text-sm">
                  Total <strong className="text-brand-700">{rupiah(b.total_price)}</strong> <span className="text-slate-500">(biaya layanan platform {rupiah(b.service_fee)})</span>
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
