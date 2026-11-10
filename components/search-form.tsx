"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { hourLabel, todayWIB } from "@/lib/format";
import Button from "@/components/ui/button";
import Field from "@/components/ui/field";
import Input from "@/components/ui/input";
import Notice from "@/components/ui/notice";
import Select from "@/components/ui/select";

type Sport = { id: string; name: string };

type Initial = {
  sport?: string;
  date?: string;
  start?: string;
  end?: string;
};

const START_HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 06 - 22
const END_HOURS = Array.from({ length: 17 }, (_, i) => i + 7); // 07 - 23

export default function SearchForm({ sportTypes, initial }: { sportTypes: Sport[]; initial?: Initial }) {
  const router = useRouter();

  const [sportId, setSportId] = useState(initial?.sport ?? "");
  const [date, setDate] = useState(initial?.date ?? todayWIB());
  const [start, setStart] = useState(initial?.start ?? "19:00");
  const [end, setEnd] = useState(initial?.end ?? "21:00");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!sportId) return setError("Pilih jenis olahraga");
    if (end <= start) return setError("Jam selesai harus setelah jam mulai");
    if (date < todayWIB()) return setError("Tanggal tidak boleh sudah lewat");

    const params = new URLSearchParams({
      sport: sportId,
      date,
      start,
      end,
    });
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-xl border bg-white p-5 shadow-lg sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
      <Field label="Jenis olahraga" htmlFor="sport">
        <Select id="sport" value={sportId} onChange={(e) => setSportId(e.target.value)}>
          <option value="">Pilih olahraga</option>
          {sportTypes.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Tanggal" htmlFor="date">
        <Input id="date" type="date" min={todayWIB()} value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>

      <Field label="Jam mulai" htmlFor="start">
        <Select id="start" value={start} onChange={(e) => setStart(e.target.value)}>
          {START_HOURS.map((h) => (
            <option key={h} value={hourLabel(h)}>
              {hourLabel(h)}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Jam selesai" htmlFor="end">
        <Select id="end" value={end} onChange={(e) => setEnd(e.target.value)}>
          {END_HOURS.map((h) => (
            <option key={h} value={hourLabel(h)}>
              {hourLabel(h)}
            </option>
          ))}
        </Select>
      </Field>

      {error && (
        <Notice tone="error" className="sm:col-span-2 lg:col-span-4">
          {error}
        </Notice>
      )}

      <div className="sm:col-span-2 lg:col-span-4">
        <Button variant="accent">Cari venue</Button>
      </div>
    </form>
  );
}
