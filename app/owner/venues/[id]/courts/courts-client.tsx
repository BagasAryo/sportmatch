"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { first } from "@/lib/utils";

export type SportType = { id: string; name: string };

export type CourtData = {
  id: string;
  name: string;
  sport_type_id: string;
  open_time: string; // format "HH:MM:SS" dari database
  close_time: string;
  price_per_hour: number;
  is_active: boolean;
  sport_types: { name: string } | {name: string}[] | null;
};

const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

export function CourtForm({ venueId, sportTypes, court, onDone }: { venueId: string; sportTypes: SportType[]; court?: CourtData; onDone?: () => void }) {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState(court?.name ?? "");
  const [sportTypeId, setSportTypeId] = useState(court?.sport_type_id ?? "");
  const [openTime, setOpenTime] = useState(court?.open_time?.slice(0, 5) ?? "08:00");
  const [closeTime, setCloseTime] = useState(court?.close_time?.slice(0, 5) ?? "22:00");
  const [price, setPrice] = useState(String(court?.price_per_hour ?? ""));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const priceNum = Number(price);
    if (!sportTypeId) return setError("Pilih jenis olahraga");
    if (!openTime.endsWith(":00") || !closeTime.endsWith(":00")) {
      return setError("Jam buka dan tutup harus jam penuh (misalnya 08:00)");
    }
    if (closeTime <= openTime) {
      return setError("Jam tutup harus lebih besar dari jam buka");
    }
    if (!Number.isInteger(priceNum) || priceNum <= 0) {
      return setError("Harga per jam harus bilangan bulat lebih dari 0");
    }

    setSaving(true);
    const payload = {
      sport_type_id: sportTypeId,
      name: name.trim(),
      open_time: openTime,
      close_time: closeTime,
      price_per_hour: priceNum,
    };

    const { error: dbErr } = court ? await supabase.from("courts").update(payload).eq("id", court.id) : await supabase.from("courts").insert({ ...payload, venue_id: venueId });

    setSaving(false);
    if (dbErr) return setError(dbErr.message);

    if (!court) {
      setName("");
      setPrice("");
    }
    router.refresh();
    onDone?.();
  }

  const inputClass = "mt-1 w-full rounded border border-slate-300 px-3 py-2 focus:border-brand-600 focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Nama lapangan</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Lapangan 1" />
        </div>
        <div>
          <label className="block text-sm font-medium">Jenis olahraga</label>
          <select required value={sportTypeId} onChange={(e) => setSportTypeId(e.target.value)} className={inputClass}>
            <option value="">Pilih jenis olahraga</option>
            {sportTypes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Jam buka</label>
          <input type="time" step={3600} required value={openTime} onChange={(e) => setOpenTime(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium">Jam tutup</label>
          <input type="time" step={3600} required value={closeTime} onChange={(e) => setCloseTime(e.target.value)} className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium">Harga per jam (Rp)</label>
          <input type="number" min={1} step={1} required value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} placeholder="50000" />
        </div>
      </div>
      <div className="flex gap-3">
        <button disabled={saving} className="rounded bg-brand-600 px-4 py-2 text-white hover:bg-brand-700 disabled:opacity-60">
          {saving ? "Menyimpan..." : court ? "Simpan perubahan" : "Tambah lapangan"}
        </button>
        {court && (
          <button type="button" onClick={onDone} className="rounded border px-4 py-2 hover:bg-slate-100">
            Batal
          </button>
        )}
      </div>
    </form>
  );
}

export function CourtRow({ court, venueId, sportTypes }: { court: CourtData; venueId: string; sportTypes: SportType[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  async function toggleActive() {
    setBusy(true);
    await supabase.from("courts").update({ is_active: !court.is_active }).eq("id", court.id);
    setBusy(false);
    router.refresh();
  }

  if (editing) {
    return (
      <li className="rounded-lg border bg-white p-4">
        <CourtForm venueId={venueId} sportTypes={sportTypes} court={court} onDone={() => setEditing(false)} />
      </li>
    );
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800">{court.name}</span>
          <span className="rounded bg-brand-50 px-2 py-0.5 text-xs text-brand-700">{first(court.sport_types)?.name}</span>
          {!court.is_active && <span className="rounded bg-slate-200 px-2 py-0.5 text-xs">Nonaktif</span>}
        </div>
        <p className="mt-1 text-sm text-slate-600">
          {court.open_time.slice(0, 5)} - {court.close_time.slice(0, 5)} &middot; {rupiah(court.price_per_hour)} per jam
        </p>
      </div>
      <div className="flex gap-2 text-sm">
        <button onClick={() => setEditing(true)} className="rounded border px-3 py-1 hover:bg-slate-100">
          Edit
        </button>
        <button onClick={toggleActive} disabled={busy} className="rounded border px-3 py-1 hover:bg-slate-100 disabled:opacity-60">
          {court.is_active ? "Nonaktifkan" : "Aktifkan"}
        </button>
      </div>
    </li>
  );
}
