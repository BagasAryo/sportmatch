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
      {/* 1. Atur Grid: Mobile 2 kolom, Tablet & Desktop 3 kolom */}
      <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-4">
        {results.map((r) => {
          const checked = selected.includes(r.venue_id);
          return (
            <li key={r.venue_id} className={`flex flex-col overflow-hidden rounded-lg border bg-white transition hover:shadow-sm ${checked ? "border-brand-600 ring-1 ring-brand-600" : ""}`}>
              <Link href={`/venues/${r.venue_id}?${detailQuery}`} className="flex-1">
                {/* 2. Bingkai Foto: Menggunakan aspect-[4/3] agar gambar tampil lebih luas */}
                <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100">
                  {r.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.photo_url} alt={r.venue_name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-brand-50 text-xs text-brand-700">Belum ada foto</div>
                  )}

                  {/* Badge Promoted di kanan atas foto */}
                  {r.is_promoted && <span className="absolute top-2 right-2 rounded-md bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-accent-600 shadow-sm">Promoted</span>}
                </div>

                {/* 3. Info Bawah: Lebih padat (p-3), ringkas, dan rapi */}
                <div className="space-y-1 p-3">
                  <h2 className="truncate text-sm font-semibold text-slate-800 sm:text-base">{r.venue_name}</h2>

                  <p className="truncate text-xs text-slate-500">
                    {r.district_name} &middot; {r.address}
                  </p>

                  <p className="text-xs text-slate-600">
                    {r.avg_rating ? (
                      <>
                        <span className="text-yellow-400">★</span> {r.avg_rating} <span className="text-slate-400">({r.review_count})</span>
                      </>
                    ) : (
                      <span className="text-slate-400">Belum ada ulasan</span>
                    )}
                  </p>

                  <p className="pt-0.5 text-xs sm:text-sm font-bold text-brand-700">Mulai {rupiah(r.min_price)}</p>
                </div>
              </Link>

              {/* Tombol Bandingkan */}
              <div className="border-t p-2.5">
                <button type="button" onClick={() => toggle(r.venue_id)} className={`w-full rounded px-2.5 py-1 text-xs font-medium transition ${checked ? "bg-brand-700 text-white" : "border text-slate-700 hover:bg-slate-100"}`}>
                  {checked ? "✓ Dipilih" : "+ Bandingkan"}
                </button>
              </div>
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
