"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatDateID, hourLabel, rupiah, todayWIB } from "@/lib/format";

export type CourtInfo = {
  id: string;
  name: string;
  sportName: string;
  open_time: string; // "HH:MM:SS"
  close_time: string;
  price_per_hour: number;
};

type Range = { start: number; end: number };
type Selection = { courtId: string; start: number; end: number };

const hourOf = (t: string) => parseInt(t.slice(0, 2), 10);

export default function Availability({ courts, defaultDate, defaultStart, defaultEnd, canBook }: { courts: CourtInfo[]; defaultDate?: string; defaultStart?: string; defaultEnd?: string; canBook: boolean }) {
  const supabase = useMemo(() => createClient(), []);
  const today = todayWIB();

  const [date, setDate] = useState(defaultDate && defaultDate >= today ? defaultDate : today);
  const [booked, setBooked] = useState<Record<string, Range[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sel, setSel] = useState<Selection | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Jam sekarang di WIB: slot pada jam yang sudah berjalan tidak bisa dipilih
  const nowHour =
    Number(
      new Date().toLocaleString("en-GB", {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        hour12: false,
      }),
    ) % 24;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      const entries = await Promise.all(
        courts.map(async (c) => {
          const { data, error: rpcErr } = await supabase.rpc("get_booked_slots", { p_court_id: c.id, p_date: date });
          if (rpcErr) throw rpcErr;
          const ranges: Range[] = ((data ?? []) as { start_time: string; end_time: string }[]).map((r) => ({ start: hourOf(r.start_time), end: hourOf(r.end_time) }));
          return [c.id, ranges] as const;
        }),
      );
      if (!cancelled) {
        setBooked(Object.fromEntries(entries));
        setLoading(false);
      }
    }

    load().catch(() => {
      if (!cancelled) {
        setError("Gagal memuat ketersediaan jadwal");
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [date, courts, supabase]);

  function isTaken(courtId: string, hour: number): boolean {
    const inBooking = (booked[courtId] ?? []).some((r) => r.start <= hour && hour < r.end);
    const alreadyPassed = date === today && hour <= nowHour;
    return inBooking || alreadyPassed;
  }

  function rangeFree(courtId: string, start: number, end: number): boolean {
    for (let h = start; h < end; h++) {
      if (isTaken(courtId, h)) return false;
    }
    return true;
  }

  // Pilih otomatis lapangan pertama yang kosong sesuai jam hasil pencarian
  useEffect(() => {
    if (loading || initialized) return;
    setInitialized(true);
    if (!defaultStart || !defaultEnd || date !== defaultDate) return;
    const s = hourOf(defaultStart);
    const e = hourOf(defaultEnd);
    const match = courts.find((c) => hourOf(c.open_time) <= s && hourOf(c.close_time) >= e && rangeFree(c.id, s, e));
    if (match) setSel({ courtId: match.id, start: s, end: e });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  function clickSlot(courtId: string, hour: number) {
    if (isTaken(courtId, hour)) return;
    setSel((prev) => {
      const cur = prev && prev.courtId === courtId ? prev : null;
      if (!cur) return { courtId, start: hour, end: hour + 1 };
      // Perluas rentang ke kanan jika semua jam di antaranya kosong
      if (hour >= cur.end && rangeFree(courtId, cur.start, hour + 1)) {
        return { ...cur, end: hour + 1 };
      }
      return { courtId, start: hour, end: hour + 1 };
    });
  }

  const selCourt = sel ? courts.find((c) => c.id === sel.courtId) : undefined;
  const hours = sel ? sel.end - sel.start : 0;
  const subtotal = selCourt ? hours * selCourt.price_per_hour : 0;

  return (
    <div>
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm font-medium">Tanggal</label>
          <input
            type="date"
            min={today}
            value={date}
            onChange={(e) => {
              setDate(e.target.value || today);
              setSel(null);
            }}
            className="mt-1 rounded border border-slate-300 bg-white px-3 py-2 focus:border-brand-600 focus:outline-none"
          />
        </div>
        <p className="pb-2 text-sm text-slate-600">{formatDateID(date)}</p>
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded border bg-white" /> Kosong
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded bg-brand-600" /> Dipilih
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded bg-slate-200" /> Terisi atau sudah lewat
        </span>
      </div>

      {error && <p className="mt-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-4 space-y-4">
        {courts.map((c) => {
          const open = hourOf(c.open_time);
          const close = hourOf(c.close_time);
          const slots = Array.from({ length: close - open }, (_, i) => open + i);
          return (
            <div key={c.id} className="rounded-lg border bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-semibold text-slate-800">{c.name}</span>
                  <span className="ml-2 rounded bg-brand-50 px-2 py-0.5 text-xs text-brand-700">{c.sportName}</span>
                </div>
                <span className="text-sm text-slate-600">
                  {rupiah(c.price_per_hour)} / jam &middot; {hourLabel(open)} - {hourLabel(close)}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                {slots.map((h) => {
                  const taken = isTaken(c.id, h);
                  const selected = sel?.courtId === c.id && h >= sel.start && h < sel.end;
                  const cls = selected
                    ? "border-brand-600 bg-brand-600 text-white"
                    : taken
                      ? "cursor-not-allowed border-slate-200 bg-slate-200 text-slate-400 line-through"
                      : "border-slate-300 bg-white text-slate-800 hover:border-brand-600";
                  return (
                    <button key={h} type="button" disabled={taken || loading} onClick={() => clickSlot(c.id, h)} className={`rounded border px-2 py-1.5 text-sm ${cls}`}>
                      {hourLabel(h)}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-0 mt-4 rounded-lg border bg-white p-4 shadow-lg">
        {!canBook ? (
          <p className="text-sm text-amber-800">Venue ini belum bisa dibooking (QRIS atau lapangan belum tersedia).</p>
        ) : sel && selCourt ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm">
              <p className="font-semibold text-slate-800">
                {selCourt.name} &middot; {hourLabel(sel.start)} - {hourLabel(sel.end)} ({hours} jam)
              </p>
              <p className="text-slate-600">
                {hours} &times; {rupiah(selCourt.price_per_hour)} = <span className="font-semibold text-brand-700">{rupiah(subtotal)}</span> (belum termasuk biaya layanan)
              </p>
            </div>
            <Link href={`/checkout?court=${selCourt.id}&date=${date}&start=${hourLabel(sel.start)}&end=${hourLabel(sel.end)}`} className="rounded bg-accent-500 px-5 py-2 font-semibold text-white hover:bg-accent-600">
              Lanjut booking
            </Link>
          </div>
        ) : (
          <p className="text-sm text-slate-600">Pilih jam yang kosong. Klik jam berikutnya untuk menambah durasi.</p>
        )}
      </div>
    </div>
  );
}
