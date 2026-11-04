"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { hourLabel, todayWIB } from "@/lib/format";

type City = { id: string; name: string };
type District = { id: string; city_id: string; name: string };
type Sport = { id: string; name: string };

type Initial = {
  city?: string;
  district?: string;
  sport?: string;
  date?: string;
  start?: string;
  end?: string;
};

const START_HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 06 - 22
const END_HOURS = Array.from({ length: 17 }, (_, i) => i + 7); // 07 - 23

export default function SearchForm({ cities, districts, sportTypes, initial }: { cities: City[]; districts: District[]; sportTypes: Sport[]; initial?: Initial }) {
  const router = useRouter();

  const [cityId, setCityId] = useState(initial?.city ?? cities[0]?.id ?? "");
  const [districtId, setDistrictId] = useState(initial?.district ?? "");
  const [sportId, setSportId] = useState(initial?.sport ?? "");
  const [date, setDate] = useState(initial?.date ?? todayWIB());
  const [start, setStart] = useState(initial?.start ?? "19:00");
  const [end, setEnd] = useState(initial?.end ?? "21:00");
  const [error, setError] = useState("");

  const districtsInCity = districts.filter((d) => d.city_id === cityId);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!sportId) return setError("Pilih jenis olahraga");
    if (end <= start) return setError("Jam selesai harus setelah jam mulai");
    if (date < todayWIB()) return setError("Tanggal tidak boleh sudah lewat");

    const params = new URLSearchParams({
      city: cityId,
      sport: sportId,
      date,
      start,
      end,
    });
    if (districtId) params.set("district", districtId);
    router.push(`/search?${params.toString()}`);
  }

  const fieldClass = "mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 focus:border-brand-600 focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-lg border bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
      <div>
        <label className="block text-sm font-medium">Kota</label>
        <select
          value={cityId}
          onChange={(e) => {
            setCityId(e.target.value);
            setDistrictId("");
          }}
          className={fieldClass}
        >
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Area / kecamatan</label>
        <select value={districtId} onChange={(e) => setDistrictId(e.target.value)} className={fieldClass}>
          <option value="">Semua kecamatan</option>
          {districtsInCity.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Jenis olahraga</label>
        <select value={sportId} onChange={(e) => setSportId(e.target.value)} className={fieldClass}>
          <option value="">Pilih olahraga</option>
          {sportTypes.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Tanggal</label>
        <input type="date" min={todayWIB()} value={date} onChange={(e) => setDate(e.target.value)} className={fieldClass} />
      </div>

      <div>
        <label className="block text-sm font-medium">Jam mulai</label>
        <select value={start} onChange={(e) => setStart(e.target.value)} className={fieldClass}>
          {START_HOURS.map((h) => (
            <option key={h} value={hourLabel(h)}>
              {hourLabel(h)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Jam selesai</label>
        <select value={end} onChange={(e) => setEnd(e.target.value)} className={fieldClass}>
          {END_HOURS.map((h) => (
            <option key={h} value={hourLabel(h)}>
              {hourLabel(h)}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2 lg:col-span-3">{error}</p>}

      <div className="sm:col-span-2 lg:col-span-3">
        <button className="w-full rounded bg-accent-500 px-5 py-3 font-semibold text-white hover:bg-accent-600 sm:w-auto">Cari venue</button>
      </div>
    </form>
  );
}
