"use client";

import { useState } from "react";
import Link from "next/link";
import { rupiah } from "@/lib/format";

export type SearchResult = {
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

export default function SearchResults({ results, detailQuery, compareQuery }: { results: SearchResult[]; detailQuery: string; compareQuery: string }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [notice, setNotice] = useState("");

  function toggle(id: string) {
    if (selected.includes(id)) {
      setSelected(selected.filter((x) => x !== id));
      setNotice("");
      return;
    }
    if (selected.length >= 3) {
      setNotice("Maksimal 3 venue untuk dibandingkan.");
      return;
    }
    setSelected([...selected, id]);
    setNotice("");
  }

  return (
    <>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 grid-cols-2">
        {results.map((r) => {
          const checked = selected.includes(r.venue_id);
          return (
            <li key={r.venue_id} className={`overflow-hidden rounded-lg border bg-white ${checked ? "border-brand-600 ring-1 ring-brand-600" : ""}`}>
              <Link href={`/venues/${r.venue_id}?${detailQuery}`}>
                {r.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.photo_url} alt={r.venue_name} className="h-44 w-full object-cover" />
                ) : (
                  <div className="flex h-44 items-center justify-center bg-brand-50 text-sm text-brand-700">Belum ada foto</div>
                )}
                <div className="space-y-1.5 p-4 pb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-slate-800">{r.venue_name}</h2>
                    {r.is_promoted && <span className="rounded bg-accent-50 px-2 py-0.5 text-xs font-medium text-accent-600">Promoted</span>}
                  </div>
                  <p className="text-sm text-slate-600">
                    {r.district_name} &middot; {r.address}
                  </p>
                  <p className="text-sm text-slate-600">
                    {r.avg_rating ? (
                      <>
                        <span className="text-yellow-400">★</span> {r.avg_rating} ({r.review_count} ulasan)
                      </>
                    ) : (
                      "Belum ada ulasan"
                    )}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold text-brand-700">Mulai {rupiah(r.min_price)}</span>
                    <span className="text-slate-500"> / jam</span>
                    <span className="text-slate-500"> &middot; {r.available_courts} lapangan kosong</span>
                  </p>
                </div>
              </Link>
              <label className="flex cursor-pointer items-center gap-2 border-t px-4 py-2 text-sm text-slate-700">
                <input type="checkbox" checked={checked} onChange={() => toggle(r.venue_id)} />
                Bandingkan
              </label>
            </li>
          );
        })}
      </ul>

      {selected.length > 0 && (
        <div className="sticky bottom-0 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-4 shadow-lg">
          <div className="text-sm">
            <p className="font-semibold text-slate-800">{selected.length} venue dipilih</p>
            <p className="text-slate-600">{notice || (selected.length < 2 ? "Pilih minimal 2 venue untuk dibandingkan." : "Siap dibandingkan.")}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSelected([]);
                setNotice("");
              }}
              className="rounded border px-3 py-2 text-sm hover:bg-slate-100"
            >
              Reset
            </button>
            {selected.length >= 2 ? (
              <Link href={`/compare?ids=${selected.join(",")}&${compareQuery}`} className="rounded bg-accent-500 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-600">
                Bandingkan sekarang
              </Link>
            ) : (
              <span className="cursor-not-allowed rounded bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-500">Bandingkan sekarang</span>
            )}
          </div>
        </div>
      )}
    </>
  );
}
