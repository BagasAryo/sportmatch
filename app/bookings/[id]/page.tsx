import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/site-header";
import StatusBadge from "@/components/status-badge";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { first } from "@/lib/utils";
import { formatDateID, rupiah } from "@/lib/format";
import PaymentActions from "./payment-actions";
import PaymentCountdown from "./payment-countdown";
import ReviewForm from "@/components/review-form";

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const { data: booking } = await supabase
    .from("bookings")
    .select("id, user_id, booking_date, start_time, end_time, subtotal, service_fee, total_price, status, rejection_note, created_at, courts(name, sport_types(name), venues(id, name, qris_image_url))")
    .eq("id", id)
    .single();

  if (!booking || booking.user_id !== profile!.id) notFound();

  const court = first(booking.courts);
  const venue = first(court?.venues);

  const { data: review } = await supabase.from("reviews").select("rating, comment, created_at").eq("booking_id", booking.id).maybeSingle();

  // Batas waktu bayar dibaca dari app_settings (sama dengan yang dipakai job pg_cron)
  const { data: setting } = await supabase.from("app_settings").select("value").eq("key", "payment_timeout_minutes").maybeSingle();
  const timeoutMinutes = Math.max(Number(setting?.value ?? 15), 1);
  const deadline = booking.status === "menunggu_bayar" ? new Date(booking.created_at).getTime() + timeoutMinutes * 60_000 : null;
  const serverNow = Date.now();

  const ended = new Date(`${booking.booking_date}T${booking.end_time}+07:00`).getTime() < Date.now();

  const pending = booking.status === "menunggu_verifikasi" || booking.status === "menunggu_bayar";

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-800">{pending ? "Pembayaran" : "Detail Booking"}</h1>
          <StatusBadge status={booking.status} />
        </div>

        {deadline !== null && (
          <div className="mt-4">
            <PaymentCountdown bookingId={booking.id} deadline={deadline} serverNow={serverNow} />
          </div>
        )}

        {booking.status === "menunggu_verifikasi" && (
          <p className="mt-4 rounded bg-sky-50 px-4 py-3 text-sm text-sky-800">Bukti pembayaran sudah terkirim. Pemilik venue akan memverifikasinya dan kamu akan mendapat pemberitahuan setelah selesai.</p>
        )}
        {booking.status === "dikonfirmasi" && <p className="mt-4 rounded bg-green-50 px-4 py-3 text-sm text-green-800">Pembayaran terverifikasi. Booking kamu sudah berlaku. Sampai jumpa di lapangan!</p>}
        {booking.status === "ditolak" && (
          <p className="mt-4 rounded bg-red-50 px-4 py-3 text-sm text-red-800">
            Bukti pembayaran ditolak
            {booking.rejection_note ? `: ${booking.rejection_note}` : "."}
          </p>
        )}
        {booking.status === "dibatalkan" && <p className="mt-4 rounded bg-slate-100 px-4 py-3 text-sm text-slate-700">Booking ini dibatalkan. Booking yang belum dibayar dalam {timeoutMinutes} menit dibatalkan otomatis.</p>}

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <section className="rounded-lg border bg-white p-5">
            <h2 className="font-semibold text-slate-800">Detail booking</h2>
            <p className="mt-1 text-sm text-slate-600">{venue?.name}</p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-600">Lapangan</dt>
                <dd className="font-medium">
                  {court?.name} ({first(court?.sport_types)?.name})
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Tanggal</dt>
                <dd className="font-medium">{formatDateID(booking.booking_date)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Jam</dt>
                <dd className="font-medium">
                  {booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Subtotal</dt>
                <dd>{rupiah(booking.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Biaya layanan</dt>
                <dd>{rupiah(booking.service_fee)}</dd>
              </div>
              <div className="flex justify-between border-t pt-2 text-base font-bold text-brand-700">
                <dt>Total</dt>
                <dd>{rupiah(booking.total_price)}</dd>
              </div>
            </dl>
            <Link href="/bookings" className="mt-4 inline-block text-sm text-brand-600 underline">
              Lihat semua booking saya
            </Link>
          </section>

          {(booking.status === "menunggu_bayar" || booking.status === "menunggu_verifikasi") && (
            <section className="rounded-lg border bg-white p-5">
              <h2 className="font-semibold text-slate-800">Bayar dengan QRIS</h2>
              {venue?.qris_image_url ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={venue.qris_image_url} alt={`QRIS ${venue.name}`} className="mx-auto mt-3 h-64 w-64 rounded border object-contain" />
                  <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate-600">
                    <li>Scan QRIS dengan e-wallet atau m-banking.</li>
                    <li>
                      Masukkan nominal <strong>persis sesuai total</strong> (QRIS ini tidak mengisi nominal otomatis).
                    </li>
                    <li>Simpan screenshot bukti pembayaran.</li>
                    <li>Unggah bukti pada form di bawah.</li>
                  </ol>
                </>
              ) : (
                <p className="mt-3 text-sm text-amber-800">QRIS venue belum tersedia.</p>
              )}

              <div className="mt-5 border-t pt-4">
                <PaymentActions bookingId={booking.id} userId={profile!.id} status={booking.status} total={booking.total_price} deadline={deadline} serverNow={serverNow} />
              </div>
            </section>
          )}
        </div>
        {booking.status === "dikonfirmasi" && (
          <section className="mt-6 rounded-lg border bg-white p-5">
            {" "}
            <h2 className="font-semibold text-slate-800">Ulasan</h2>{" "}
            {review ? (
              <div className="mt-2">
                {" "}
                <p className="text-lg font-medium text-accent-500">
                  {" "}
                  {"★".repeat(review.rating)} <span className="text-slate-300">{"★".repeat(5 - review.rating)}</span>{" "}
                </p>{" "}
                {review.comment && <p className="mt-1 text-sm text-slate-700">{review.comment}</p>} <p className="mt-1 text-xs text-slate-500"> Terima kasih, ulasanmu sudah tampil di halaman venue. </p>{" "}
              </div>
            ) : ended ? (
              <div className="mt-3">
                {" "}
                <ReviewForm bookingId={booking.id} />{" "}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-600"> Kamu bisa memberi ulasan setelah waktu booking selesai. </p>
            )}{" "}
          </section>
        )}
      </main>
    </div>
  );
}
