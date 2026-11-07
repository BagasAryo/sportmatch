import Link from "next/link";
import SiteHeader from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";
import { first } from "@/lib/utils";
import { formatDateID, rupiah, todayWIB } from "@/lib/format";
import { createBooking } from "./actions";

const hourOf = (t: string) => parseInt(t.slice(0, 2), 10);

function Problem({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-xl px-4 py-10">
        <p className="rounded bg-amber-50 px-4 py-3 text-amber-800">{message}</p>
        <Link href="/" className="mt-4 inline-block text-brand-600 underline">
          Kembali ke beranda
        </Link>
      </main>
    </div>
  );
}

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { court, date, start, end, error } = await searchParams;

  const shapeOk = !!court && !!date && !!start && !!end && /^\d{4}-\d{2}-\d{2}$/.test(date) && /^\d{2}:00$/.test(start) && /^\d{2}:00$/.test(end);

  if (!shapeOk) {
    return <Problem message="Data booking tidak lengkap. Silakan pilih jam dari halaman venue." />;
  }

  const supabase = await createClient();

  const { data: courtRow } = await supabase.from("courts").select("id, name, open_time, close_time, price_per_hour, is_active, sport_types(name), venues(id, name, address, is_active, qris_image_url)").eq("id", court!).single();

  const venue = first(courtRow?.venues);
  if (!courtRow || !courtRow.is_active || !venue || !venue.is_active) {
    return <Problem message="Lapangan tidak ditemukan atau sedang tidak aktif." />;
  }

  const startH = hourOf(start!);
  const endH = hourOf(end!);

  let problem = "";
  if (endH <= startH) problem = "Jam selesai harus setelah jam mulai.";
  else if (date! < todayWIB()) problem = "Tanggal booking sudah lewat.";
  else if (startH < hourOf(courtRow.open_time) || endH > hourOf(courtRow.close_time)) problem = "Jam yang dipilih berada di luar jam operasional lapangan.";
  else if (!venue.qris_image_url) problem = "Venue ini belum menyediakan QRIS pembayaran.";

  if (problem) return <Problem message={problem} />;

  const { data: feeRow } = await supabase.from("app_settings").select("value").eq("key", "service_fee").maybeSingle();
  const fee: number = feeRow?.value ?? 5000;

  const hours = endH - startH;
  const subtotal = hours * courtRow.price_per_hour;
  const total = subtotal + fee;

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-xl px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-800">Konfirmasi orderan</h1>
        <p className="mt-1 text-sm text-slate-600">Periksa kembali detail booking sebelum melanjutkan ke pembayaran.</p>

        {error && <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div className="mt-5 rounded-lg border bg-white p-5">
          <h2 className="font-semibold text-slate-800">{venue.name}</h2>
          <p className="text-sm text-slate-600">{venue.address}</p>

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-600">Lapangan</dt>
              <dd className="font-medium">
                {courtRow.name} ({first(courtRow.sport_types)?.name})
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Tanggal</dt>
              <dd className="font-medium">{formatDateID(date!)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Jam</dt>
              <dd className="font-medium">
                {start} - {end} ({hours} jam)
              </dd>
            </div>
          </dl>

          <hr className="my-4" />

          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-600">
                {hours} jam &times; {rupiah(courtRow.price_per_hour)}
              </dt>
              <dd>{rupiah(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Biaya layanan</dt>
              <dd>{rupiah(fee)}</dd>
            </div>
            <div className="flex justify-between border-t pt-2 text-base font-bold text-brand-700">
              <dt>Total</dt>
              <dd>{rupiah(total)}</dd>
            </div>
          </dl>
        </div>

        <form action={createBooking} className="mt-5">
          <input type="hidden" name="court" value={court} />
          <input type="hidden" name="date" value={date} />
          <input type="hidden" name="start" value={start} />
          <input type="hidden" name="end" value={end} />
          <button className="w-full rounded bg-accent-500 px-5 py-3 font-semibold text-white hover:bg-accent-600">Bayar sekarang</button>
          <p className="mt-2 text-center text-xs text-slate-500">Slot akan ditahan untukmu setelah kamu menekan tombol ini.</p>
        </form>

        <Link href={`/venues/${venue.id}?date=${date}&start=${start}&end=${end}`} className="mt-4 inline-block text-sm text-brand-600 underline">
          &larr; Kembali ke venue
        </Link>
      </main>
    </div>
  );
}
