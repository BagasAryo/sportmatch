import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import Availability, { type CourtInfo } from "@/components/availability";
import { createClient } from "@/lib/supabase/server";
import { first } from "@/lib/utils";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("venues").select("name").eq("id", id).maybeSingle();
  return { title: data?.name ?? "Venue" };
}

export default async function VenueDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ date?: string; start?: string; end?: string; sport?: string }> }) {
  const { id } = await params;
  const { date, start, end, sport } = await searchParams;
  const supabase = await createClient();

  const { data: venue } = await supabase.from("venues").select("*").eq("id", id).single();

  if (!venue) notFound();

  const { data: courtRows } = await supabase.from("courts").select("id, name, sport_type_id, open_time, close_time, price_per_hour, sport_types(name)").eq("venue_id", id).eq("is_active", true).order("name");

  const allCourts = (courtRows ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    sportTypeId: c.sport_type_id,
    sportName: first(c.sport_types)?.name ?? "",
    open_time: c.open_time,
    close_time: c.close_time,
    price_per_hour: c.price_per_hour,
  }));

  const filtered = sport ? allCourts.filter((c) => c.sportTypeId === sport) : allCourts;
  const courts: CourtInfo[] = filtered.length > 0 ? filtered : allCourts;
  const filterActive = !!sport && filtered.length > 0 && filtered.length < allCourts.length;
  const filterSportName = filterActive ? filtered[0].sportName : "";

  const q = new URLSearchParams();
  if (date) q.set("date", date);
  if (start) q.set("start", start);
  if (end) q.set("end", end);
  const showAllHref = `/venues/${id}${q.toString() ? `?${q}` : ""}`;

  const { data: rating } = await supabase.from("venue_ratings").select("avg_rating, review_count").eq("venue_id", id).maybeSingle();

  const { data: reviews } = await supabase.from("reviews").select("id, rating, comment, created_at").eq("venue_id", id).order("created_at", { ascending: false }).limit(10);

  const photos: string[] = venue.photo_urls ?? [];
  const facilities: string[] = venue.facilities ?? [];
  const canBook = !!venue.qris_image_url && courts.length > 0;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {photos.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photos[0]} alt={venue.name} className="h-64 w-full rounded-lg object-cover sm:col-span-2 sm:h-80" />
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-1">
              {photos.slice(1, 3).map((url) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={url} src={url} alt={venue.name} className="h-24 w-full rounded-lg object-cover sm:h-38" />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-48 items-center justify-center rounded-lg bg-brand-50 text-brand-700">Belum ada foto</div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold text-slate-800">{venue.name}</h1>
          {venue.is_promoted && <span className="rounded bg-accent-50 px-2 py-0.5 text-xs font-medium text-accent-600">Promoted</span>}
        </div>
        <p className="mt-1 text-slate-600">{venue.address}</p>
        <p className="mt-1 text-sm text-slate-600">
          {rating?.avg_rating ? (
            <>
              <span className="text-accent-500">★</span> {rating.avg_rating} ({rating.review_count} ulasan)
            </>
          ) : (
            "Belum ada ulasan"
          )}
          {venue.maps_url && (
            <>
              {" "}
              &middot;{" "}
              <a href={venue.maps_url} target="_blank" rel="noopener noreferrer" className="text-brand-600 underline">
                Lihat di Google Maps
              </a>
            </>
          )}
        </p>

        {venue.description && <p className="mt-4 whitespace-pre-line text-slate-700">{venue.description}</p>}

        {facilities.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {facilities.map((f) => (
              <span key={f} className="rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-700">
                {f}
              </span>
            ))}
          </div>
        )}

        <section className="mt-8">
          <h2 className="mb-3 text-xl font-bold text-slate-800">Pilih lapangan dan jam</h2>
          {filterActive && (
            <p className="mb-3 text-sm text-slate-600">
              Menampilkan lapangan <strong>{filterSportName}</strong> sesuai pencarianmu.{" "}
              <Link href={showAllHref} className="text-brand-600 underline">
                Tampilkan semua lapangan
              </Link>
            </p>
          )}
          {courts.length === 0 ? (
            <p className="rounded-xl border border-dashed bg-white p-6 text-center text-slate-500">Venue ini belum memiliki lapangan aktif.</p>
          ) : (
            <Availability courts={courts} defaultDate={date} defaultStart={start} defaultEnd={end} canBook={canBook} />
          )}
        </section>

        <section className="mt-10">
          <h2 className="mb-3 text-xl font-bold text-slate-800">Ulasan</h2>
          {!reviews || reviews.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada ulasan.</p>
          ) : (
            <ul className="space-y-3">
              {reviews.map((r) => (
                <li key={r.id} className="rounded-xl border bg-white p-4 shadow-sm">
                  <p className="font-medium text-accent-600">
                    {"★".repeat(r.rating)}
                    <span className="text-slate-300">{"★".repeat(5 - r.rating)}</span>
                  </p>
                  {r.comment && <p className="mt-1 text-slate-700">{r.comment}</p>}
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(r.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
