import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import SearchForm from "@/components/search-form";
import Notice from "@/components/ui/notice";
import SearchResults, { type SearchResult } from "@/components/search-results";
import { createClient } from "@/lib/supabase/server";
import { formatDateID, todayWIB } from "@/lib/format";

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { sport, date, start, end } = await searchParams;
  const supabase = await createClient();

  const { data: sportTypes } = await supabase.from("sport_types").select("id, name").order("name");

  let results: SearchResult[] = [];
  let message = "";

  const validShape = sport && date && start && end && /^\d{4}-\d{2}-\d{2}$/.test(date) && /^\d{2}:00$/.test(start) && /^\d{2}:00$/.test(end);

  if (!validShape) {
    message = "Lengkapi pencarian: pilih jenis olahraga, tanggal, dan jam.";
  } else if (end! <= start!) {
    message = "Jam selesai harus setelah jam mulai.";
  } else if (date! < todayWIB()) {
    message = "Tanggal pencarian sudah lewat.";
  } else {
    const { data, error } = await supabase.rpc("search_available_venues", {
      p_sport_type_id: sport,
      p_date: date,
      p_start: start,
      p_end: end,
    });
    if (error) {
      message = `Pencarian gagal: ${error.message}`;
    } else {
      results = (data ?? []) as SearchResult[];
    }
  }

  const sportName = sportTypes?.find((s) => s.id === sport)?.name ?? "";
  const showResults = !!validShape && !message;
  const detailQuery = `date=${date}&start=${start}&end=${end}&sport=${sport}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />

      <section className="bg-brand-600 px-4 pb-20 pt-8 text-white">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-2xl font-bold sm:text-3xl">{showResults ? `Venue ${sportName}`.trim() : "Cari venue"}</h1>
          {showResults && (
            <p className="mt-1 text-brand-100">
              {formatDateID(date!)} &middot; {start} - {end} &middot; {results.length} venue tersedia
            </p>
          )}
        </div>
      </section>

      <main className="mx-auto -mt-12 max-w-5xl px-4 pb-16">
        <SearchForm sportTypes={sportTypes ?? []} initial={{ sport, date, start, end }} />

        {message && (
          <Notice tone="warning" className="mt-4">
            {message}
          </Notice>
        )}

        {showResults && results.length === 0 && <div className="mt-6 rounded-xl border border-dashed bg-white p-8 text-center text-slate-500">Belum ada venue yang kosong pada waktu itu. Coba ubah jam atau tanggal.</div>}

        <SearchResults results={results} detailQuery={detailQuery} compareQuery={detailQuery} />
      </main>

      <SiteFooter />
    </div>
  );
}
