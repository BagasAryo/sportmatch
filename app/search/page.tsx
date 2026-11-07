import SiteHeader from "@/components/site-header";
import SearchForm from "@/components/search-form";
import { createClient } from "@/lib/supabase/server";
import { formatDateID, todayWIB } from "@/lib/format";
import SearchResults from "@/components/search-results";

type Result = {
  venue_id: string;
  venue_name: string;
  address: string;
  district_name: string;
  photo_url: string | null;
  is_promoted: boolean;
  avg_rating: number | null;
  review_count: number;
  min_price: number;
  available_courts: number;
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { sport, date, start, end } = await searchParams;
  const supabase = await createClient();

  const { data: sportTypes } = await supabase.from("sport_types").select("id, name").order("name");

  let results: Result[] = [];
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
      results = (data ?? []) as Result[];
    }
  }

  const sportName = sportTypes?.find((s) => s.id === sport)?.name;

  const detailQuery = `date=${date}&start=${start}&end=${end}&sport=${sport}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <details className="mb-6 rounded-lg border bg-white p-4">
          <summary className="cursor-pointer text-sm font-medium text-brand-700">Ubah pencarian</summary>
          <div className="mt-4">
            <SearchForm sportTypes={sportTypes ?? []} initial={{ sport, date, start, end }} />
          </div>
        </details>

        {validShape && !message && (
          <>
            <h1 className="text-2xl font-bold text-slate-800">Venue {sportName}</h1>
            <p className="mt-1 text-sm text-slate-600">
              {formatDateID(date!)} &middot; {start} - {end} &middot; {results.length} venue tersedia
            </p>
          </>
        )}

        {message && <p className="rounded bg-amber-50 px-4 py-3 text-sm text-amber-800">{message}</p>}

        {validShape && !message && results.length === 0 && <p className="mt-6 rounded border border-dashed bg-white p-8 text-center text-slate-500">Belum ada venue yang kosong pada waktu itu. Coba ubah jam atau tanggal.</p>}

        <SearchResults results={results} detailQuery={detailQuery} compareQuery={`date=${date}&start=${start}&end=${end}&sport=${sport}`} />
      </main>
    </div>
  );
}
