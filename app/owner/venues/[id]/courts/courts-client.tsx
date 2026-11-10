"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { first } from "@/lib/utils";
import { rupiah } from "@/lib/format";
import Button from "@/components/ui/button";
import Field from "@/components/ui/field";
import Input from "@/components/ui/input";
import Notice from "@/components/ui/notice";
import Select from "@/components/ui/select";

export type SportType = { id: string; name: string };

export type CourtData = {
  id: string;
  name: string;
  sport_type_id: string;
  open_time: string; // format "HH:MM:SS" dari database
  close_time: string;
  price_per_hour: number;
  is_active: boolean;
  sport_types: { name: string } | { name: string }[] | null;
};

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

  // id unik per form supaya label tidak bentrok saat beberapa form tampil bersamaan
  const uid = court?.id ?? "new";

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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Notice tone="error">{error}</Notice>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nama lapangan" htmlFor={`name-${uid}`}>
          <Input id={`name-${uid}`} required value={name} onChange={(e) => setName(e.target.value)} placeholder="Lapangan 1" />
        </Field>
        <Field label="Jenis olahraga" htmlFor={`sport-${uid}`}>
          <Select id={`sport-${uid}`} required value={sportTypeId} onChange={(e) => setSportTypeId(e.target.value)}>
            <option value="">Pilih jenis olahraga</option>
            {sportTypes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Jam buka" htmlFor={`open-${uid}`}>
          <Input id={`open-${uid}`} type="time" step={3600} required value={openTime} onChange={(e) => setOpenTime(e.target.value)} />
        </Field>
        <Field label="Jam tutup" htmlFor={`close-${uid}`}>
          <Input id={`close-${uid}`} type="time" step={3600} required value={closeTime} onChange={(e) => setCloseTime(e.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Harga per jam (Rp)" htmlFor={`price-${uid}`}>
            <Input id={`price-${uid}`} type="number" min={1} step={1} required value={price} onChange={(e) => setPrice(e.target.value)} placeholder="50000" />
          </Field>
        </div>
      </div>
      <div className="flex gap-3">
        <Button disabled={saving}>{saving ? "Menyimpan..." : court ? "Simpan perubahan" : "Tambah lapangan"}</Button>
        {court && (
          <Button type="button" variant="outline" onClick={onDone}>
            Batal
          </Button>
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
      <li className="rounded-xl border bg-white p-4 shadow-sm">
        <CourtForm venueId={venueId} sportTypes={sportTypes} court={court} onDone={() => setEditing(false)} />
      </li>
    );
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-4 shadow-sm">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-800">{court.name}</span>
          <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">{first(court.sport_types)?.name}</span>
          {!court.is_active && <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-700">Nonaktif</span>}
        </div>
        <p className="mt-1 text-sm text-slate-600">
          {court.open_time.slice(0, 5)} - {court.close_time.slice(0, 5)} &middot; {rupiah(court.price_per_hour)} per jam
        </p>
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setEditing(true)}>
          Edit
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={toggleActive} disabled={busy}>
          {court.is_active ? "Nonaktifkan" : "Aktifkan"}
        </Button>
      </div>
    </li>
  );
}
