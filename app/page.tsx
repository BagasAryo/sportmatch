import SiteHeader from "@/components/site-header";
import SearchForm from "@/components/search-form";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const { data: sportTypes } = await supabase.from("sport_types").select("id, name").order("name");

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />

      <section className="bg-brand-600 px-4 py-14 text-white">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold sm:text-5xl">SportMatch</h1>
          <p className="mt-2 text-lg text-brand-100">Temukan. Bandingkan. Booking. Platform digital booking fasilitas olahraga.</p>
        </div>
      </section>

      <main className="mx-auto -mt-8 max-w-5xl px-4 pb-16">
        <SearchForm sportTypes={sportTypes ?? []} />

        <section className="mt-12">
          <h2 className="text-xl font-bold text-slate-800">Cara kerja</h2>
          <ol className="mt-4 grid gap-4 sm:grid-cols-3">
            {[
              ["1", "Cari", "Pilih olahraga, tanggal, dan jam."],
              ["2", "Bandingkan", "Lihat harga, fasilitas, dan ulasan venue yang tersedia."],
              ["3", "Booking", "Bayar lewat QRIS venue dan unggah bukti pembayaran."],
            ].map(([n, title, desc]) => (
              <li key={n} className="rounded-lg border bg-white p-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 font-bold text-white">{n}</span>
                <h3 className="mt-3 font-semibold text-slate-800">{title}</h3>
                <p className="mt-1 text-sm text-slate-600">{desc}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </div>
  );
}
