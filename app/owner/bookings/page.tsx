import StatusBadge from "@/components/status-badge";
import Notice from "@/components/ui/notice";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { first } from "@/lib/utils";
import { formatDateID, rupiah } from "@/lib/format";
import VerifyActions from "./verify-actions";

export default async function OwnerBookingsPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  // courts!inner dan venues!inner: hanya booking di venue milik akun ini
  const { data: bookings } = await supabase
    .from("bookings")
    .select(
      "id, booking_date, start_time, end_time, subtotal, service_fee, total_price, status, payment_proof_path, rejection_note, created_at, profiles(full_name, phone), courts!inner(name, sport_types(name), venues!inner(name, owner_id))",
    )
    .eq("courts.venues.owner_id", profile!.id)
    .order("created_at", { ascending: false });

  const all = bookings ?? [];
  const pending = all.filter((b) => b.status === "menunggu_verifikasi");
  const history = all.filter((b) => b.status !== "menunggu_verifikasi");

  function Card({ b }: { b: (typeof all)[number] }) {
    const court = first(b.courts);
    const venue = first(court?.venues);
    const booker = first(b.profiles);
    const needsAction = b.status === "menunggu_verifikasi";
    return (
      <li className={`rounded-xl border bg-white p-4 shadow-sm ${needsAction ? "border-l-4 border-l-accent-500" : ""}`}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-slate-800">
              {venue?.name} &middot; {court?.name} ({first(court?.sport_types)?.name})
            </p>
            <p className="text-sm text-slate-600">
              Pemesan: {booker?.full_name || "-"}
              {booker?.phone ? ` (${booker.phone})` : ""}
            </p>
          </div>
          <StatusBadge status={b.status} />
        </div>
        <p className="mt-2 text-sm text-slate-600">
          {formatDateID(b.booking_date)} &middot; {b.start_time.slice(0, 5)} - {b.end_time.slice(0, 5)}
        </p>
        <p className="text-sm">
          Total dibayar user: <strong className="text-brand-700">{rupiah(b.total_price)}</strong>{" "}
          <span className="text-slate-500">
            (subtotal {rupiah(b.subtotal)} + biaya layanan {rupiah(b.service_fee)})
          </span>
        </p>
        {b.status === "ditolak" && b.rejection_note && (
          <Notice tone="error" className="mt-2">
            Alasan penolakan: {b.rejection_note}
          </Notice>
        )}
        {needsAction && <VerifyActions bookingId={b.id} proofPath={b.payment_proof_path} />}
      </li>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-800">Booking masuk</h1>

      <h2 className="mb-3 mt-6 flex items-center gap-2 text-lg font-semibold text-slate-800">
        Perlu diverifikasi
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${pending.length > 0 ? "bg-accent-500 text-white" : "bg-slate-200 text-slate-600"}`}>{pending.length}</span>
      </h2>
      {pending.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-white p-6 text-center text-sm text-slate-500">Tidak ada bukti pembayaran yang menunggu verifikasi.</div>
      ) : (
        <ul className="space-y-3">
          {pending.map((b) => (
            <Card key={b.id} b={b} />
          ))}
        </ul>
      )}

      <h2 className="mb-3 mt-8 text-lg font-semibold text-slate-800">Riwayat</h2>
      {history.length === 0 ? (
        <p className="text-sm text-slate-500">Belum ada riwayat booking.</p>
      ) : (
        <ul className="space-y-3">
          {history.map((b) => (
            <Card key={b.id} b={b} />
          ))}
        </ul>
      )}
    </div>
  );
}
