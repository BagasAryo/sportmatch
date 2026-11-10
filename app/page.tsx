import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import SearchForm from "@/components/search-form";
import { buttonClass } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";

const steps = [
  ["1", "Cari venue", "Pilih olahraga, tanggal, dan jam. Hanya venue yang masih kosong yang ditampilkan."],
  ["2", "Pilih lapangan", "Bandingkan harga, fasilitas, dan ulasan, lalu pilih lapangan dan jam mainnya."],
  ["3", "Bayar dan konfirmasi", "Bayar lewat QRIS venue, unggah bukti, lalu tunggu konfirmasi dari pemilik."],
];

const ownerPoints = [
  ["QRIS milik venue sendiri", "Unggah QRIS venue, pemain membayar lewat QRIS tersebut."],
  ["Jadwal anti bentrok", "Satu jam di satu lapangan tidak bisa dipesan dua kali."],
  ["Notifikasi bukti bayar", "Pemberitahuan masuk saat ada bukti pembayaran yang perlu diverifikasi."],
];

export default async function Home() {
  const supabase = await createClient();
  const [{ data: sportTypes }, profile] = await Promise.all([supabase.from("sport_types").select("id, name").order("name"), getCurrentProfile()]);

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />

      <section className="bg-brand-600 px-4 pb-24 pt-14 text-white flex justify-center text-center">
        <div className="mx-auto max-w-5xl">
          <h1 className="max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">Temukan dan booking lapangan olahraga favoritmu</h1>
          <p className="mt-4 max-w-xl text-md text-brand-100">Cari lapangan futsal, badminton, dan voli yang masih kosong, lalu booking dengan membayar lewat QRIS venue.</p>
        </div>
      </section>

      <main className="mx-auto -mt-14 max-w-5xl px-4 pb-16">
        <SearchForm sportTypes={sportTypes ?? []} />

        <section id="cara-kerja" className="mt-16">
          <h2 className="text-2xl font-bold text-slate-800">Pesan lapangan semudah 1-2-3</h2>
          <p className="mt-2 max-w-xl text-slate-600">Dari mencari sampai konfirmasi, semuanya selesai tanpa perlu chat berulang ke pengelola.</p>

          <ol className="mt-8 grid gap-8 sm:grid-cols-3">
            {steps.map(([n, title, desc], i) => (
              <li key={n} className={`relative ${i < steps.length - 1 ? "after:absolute after:left-14 after:right-6 after:top-5 after:hidden after:h-px after:bg-brand-100 sm:after:block" : ""}`}>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 font-bold text-white">{n}</span>
                <h3 className="mt-4 font-semibold text-slate-800">{title}</h3>
                <p className="mt-1 text-sm text-slate-600">{desc}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-16 grid gap-8 rounded-2xl bg-brand-700 p-8 text-white sm:p-10 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold leading-tight">Punya lapangan olahraga?</h2>
            <p className="mt-3 text-brand-100">Kelola jadwal dan booking lapanganmu di satu tempat.</p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {!profile && (
                <>
                  <Link href="/register?as=owner" className={buttonClass("accent")}>
                    Daftar sebagai pemilik
                  </Link>
                  <Link href="/login" className={buttonClass("outlineLight")}>
                    Sudah punya akun? Masuk
                  </Link>
                </>
              )}
              {profile && profile.role !== "user" && (
                <Link href={profile.role === "admin" ? "/admin" : "/owner"} className={buttonClass("accent")}>
                  Buka dashboard
                </Link>
              )}
              {profile?.role === "user" && <p className="text-sm text-brand-100">Pengajuan sebagai pemilik saat ini hanya lewat pendaftaran akun baru.</p>}
            </div>
            {!profile && <p className="mt-3 text-sm text-brand-100">Akun pemilik diverifikasi admin terlebih dahulu.</p>}
          </div>

          <ul className="space-y-5">
            {ownerPoints.map(([title, desc]) => (
              <li key={title} className="border-l-2 border-accent-500 pl-4">
                <p className="font-semibold">{title}</p>
                <p className="mt-0.5 text-sm text-brand-100">{desc}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
