import Link from "next/link";
import SiteHeader from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";
import { first } from "@/lib/utils";
import { rupiah } from "@/lib/format";
import SiteFooter from "@/components/site-footer";
import ProblemPage from "@/components/problem-page";
import { buttonClass } from "@/components/ui/button";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const hourOf = (t: string) => parseInt(t.slice(0, 2), 10);
const hh = (h: number) => `${String(h).padStart(2, "0")}:00`;

export default async function ComparePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { ids, date, start, end, sport } = await searchParams;

  const idList = (ids ?? "")
    .split(",")
    .filter((id) => UUID.test(id))
    .slice(0, 3);

  if (idList.length < 2) {
    return <ProblemPage message="Pilih minimal 2 venue dari hasil pencarian untuk dibandingkan." />;
  }

  const supabase = await createClient();

  const [{ data: venues }, { data: courts }, { data: ratings }] = await Promise.all([
    supabase.from("venues").select("id, name, address, photo_urls, facilities, is_promoted, qris_image_url").in("id", idList),
    supabase.from("courts").select("venue_id, price_per_hour, open_time, close_time, sport_types(name)").in("venue_id", idList).eq("is_active", true),
    supabase.from("venue_ratings").select("venue_id, avg_rating, review_count").in("venue_id", idList),
  ]);

  const passthrough = new URLSearchParams();
  if (date) passthrough.set("date", date);
  if (start) passthrough.set("start", start);
  if (end) passthrough.set("end", end);
  if (sport) passthrough.set("sport", sport);
  const query = passthrough.toString();

  const rows = idList
    .map((id) => (venues ?? []).find((v) => v.id === id))
    .filter((v): v is NonNullable<typeof v> => !!v)
    .map((v) => {
      const vc = (courts ?? []).filter((c) => c.venue_id === v.id);
      const prices = vc.map((c) => c.price_per_hour as number);
      const sports = Array.from(new Set(vc.map((c) => first(c.sport_types)?.name).filter(Boolean))) as string[];
      const rating = (ratings ?? []).find((r) => r.venue_id === v.id);
      return {
        id: v.id,
        name: v.name,
        isPromoted: v.is_promoted as boolean,
        photo: (v.photo_urls as string[] | null)?.[0] ?? null,
        address: v.address as string,
        minPrice: prices.length ? Math.min(...prices) : 0,
        maxPrice: prices.length ? Math.max(...prices) : 0,
        sports,
        open: vc.length ? Math.min(...vc.map((c) => hourOf(c.open_time))) : null,
        close: vc.length ? Math.max(...vc.map((c) => hourOf(c.close_time))) : null,
        courtCount: vc.length,
        facilities: (v.facilities as string[] | null) ?? [],
        avg: rating?.avg_rating ? Number(rating.avg_rating) : null,
        reviews: rating?.review_count ? Number(rating.review_count) : 0,
        canBook: !!v.qris_image_url && vc.length > 0,
      };
    });

  const validPrices = rows.map((r) => r.minPrice).filter((p) => p > 0);
  const bestPrice = validPrices.length ? Math.min(...validPrices) : null;
  const ratedAvgs = rows.map((r) => r.avg).filter((a): a is number => a !== null);
  const bestRating = ratedAvgs.length ? Math.max(...ratedAvgs) : null;

  const best = "font-semibold text-green-700";

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-800">Bandingkan venue</h1>
        <p className="mt-1 text-sm text-slate-600">Nilai terbaik pada harga dan rating ditandai hijau.</p>

        <div className="mt-5 overflow-x-auto rounded-xl border bg-white shadow-sm">
          <table className="w-full min-w-160 text-sm">
            <thead>
              <tr className="border-b bg-brand-50 text-left">
                <th className="w-36 p-3 font-medium text-slate-600"></th>
                {rows.map((r) => (
                  <th key={r.id} className="p-3 align-top">
                    {r.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.photo} alt={r.name} className="mb-2 h-28 w-full rounded-lg object-cover" />
                    ) : (
                      <div className="mb-2 flex h-28 items-center justify-center rounded-lg bg-brand-50 text-xs text-brand-700">Belum ada foto</div>
                    )}
                    <span className="text-base font-semibold text-slate-800">{r.name}</span>
                    {r.isPromoted && <span className="ml-2 rounded bg-accent-50 px-2 py-0.5 text-xs font-medium text-accent-600">Promoted</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="p-3 text-slate-600">Alamat</td>
                {rows.map((r) => (
                  <td key={r.id} className="p-3">
                    {r.address}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 text-slate-600">Harga mulai</td>
                {rows.map((r) => (
                  <td key={r.id} className={`p-3 ${r.minPrice > 0 && r.minPrice === bestPrice ? best : ""}`}>
                    {r.minPrice > 0 ? `${rupiah(r.minPrice)} / jam` : "-"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 text-slate-600">Rentang harga</td>
                {rows.map((r) => (
                  <td key={r.id} className="p-3">
                    {r.minPrice > 0 ? (r.minPrice === r.maxPrice ? rupiah(r.minPrice) : `${rupiah(r.minPrice)} - ${rupiah(r.maxPrice)}`) : "-"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 text-slate-600">Olahraga</td>
                {rows.map((r) => (
                  <td key={r.id} className="p-3">
                    {r.sports.length ? r.sports.join(", ") : "-"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 text-slate-600">Jam operasional</td>
                {rows.map((r) => (
                  <td key={r.id} className="p-3">
                    {r.open !== null && r.close !== null ? `${hh(r.open)} - ${hh(r.close)}` : "-"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 text-slate-600">Jumlah lapangan</td>
                {rows.map((r) => (
                  <td key={r.id} className="p-3">
                    {r.courtCount}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 text-slate-600">Fasilitas</td>
                {rows.map((r) => (
                  <td key={r.id} className="p-3">
                    {r.facilities.length ? r.facilities.join(", ") : "-"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 text-slate-600">Rating</td>
                {rows.map((r) => (
                  <td key={r.id} className={`p-3 ${r.avg !== null && r.avg === bestRating ? best : ""}`}>
                    {r.avg !== null ? `★ ${r.avg} (${r.reviews} ulasan)` : "Belum ada ulasan"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 text-slate-600">Status booking</td>
                {rows.map((r) => (
                  <td key={r.id} className="p-3">
                    {r.canBook ? <span className="text-green-700">Bisa dibooking</span> : <span className="text-accent-600">Belum bisa dibooking</span>}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3"></td>
                {rows.map((r) => (
                  <td key={r.id} className="p-3">
                    <Link href={`/venues/${r.id}${query ? `?${query}` : ""}`} className={buttonClass("primary")}>
                      Lihat venue
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
