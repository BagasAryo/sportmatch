"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export type VenueData = {
  id: string;
  name: string;
  address: string;
  description: string | null;
  district_id: string;
  facilities: string[];
  photo_urls: string[];
  qris_image_url: string | null;
  maps_url: string | null;
  is_active: boolean;
};

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

function validateImage(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `${file.name}: format harus JPG, PNG, atau WebP`;
  }
  if (file.size > MAX_SIZE) {
    return `${file.name}: ukuran maksimal 2 MB`;
  }
  return null;
}

export default function VenueForm({ ownerId, defaultDistrictId, venue }: { ownerId: string; defaultDistrictId?: string; venue?: VenueData }) {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState(venue?.name ?? "");
  const [address, setAddress] = useState(venue?.address ?? "");
  const [description, setDescription] = useState(venue?.description ?? "");
  // Semua venue berada di Gunungpati: venue baru memakai kecamatan bawaan, venue lama tetap
  const districtId = venue?.district_id ?? defaultDistrictId ?? "";
  const [facilities, setFacilities] = useState((venue?.facilities ?? []).join(", "));
  const [mapsUrl, setMapsUrl] = useState(venue?.maps_url ?? "");
  const [isActive, setIsActive] = useState(venue?.is_active ?? true);

  const [photoUrls, setPhotoUrls] = useState<string[]>(venue?.photo_urls ?? []);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [qrisUrl, setQrisUrl] = useState<string | null>(venue?.qris_image_url ?? null);
  const [newQris, setNewQris] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Upload ke bucket venue-photos dengan path {owner_id}/{nama_file}
  async function uploadFile(file: File, prefix: string): Promise<string> {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${ownerId}/${prefix}${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("venue-photos").upload(path, file, { contentType: file.type });
    if (upErr) throw upErr;
    return supabase.storage.from("venue-photos").getPublicUrl(path).data.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!districtId) {
      setError("Kecamatan Gunungpati belum ada di data master. Hubungi admin.");
      return;
    }
    const filesToCheck = [...newPhotos, ...(newQris ? [newQris] : [])];
    for (const f of filesToCheck) {
      const msg = validateImage(f);
      if (msg) {
        setError(msg);
        return;
      }
    }

    setSaving(true);
    try {
      const uploaded: string[] = [];
      for (const f of newPhotos) {
        uploaded.push(await uploadFile(f, ""));
      }
      let finalQris = qrisUrl;
      if (newQris) {
        finalQris = await uploadFile(newQris, "qris-");
      }

      const payload = {
        district_id: districtId,
        name: name.trim(),
        address: address.trim(),
        description: description.trim() || null,
        facilities: facilities
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        photo_urls: [...photoUrls, ...uploaded],
        qris_image_url: finalQris,
        maps_url: mapsUrl.trim() || null,
        is_active: isActive,
      };

      if (venue) {
        const { error: dbErr } = await supabase.from("venues").update(payload).eq("id", venue.id);
        if (dbErr) throw dbErr;
      } else {
        const { error: dbErr } = await supabase.from("venues").insert({ ...payload, owner_id: ownerId });
        if (dbErr) throw dbErr;
      }

      router.push("/owner");
      router.refresh();
    } catch (err) {
      const message = (err as { message?: string })?.message ?? "Gagal menyimpan venue";
      setError(message);
      setSaving(false);
    }
  }

  const inputClass = "mt-1 w-full rounded border border-slate-300 px-3 py-2 focus:border-brand-600 focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border bg-white p-6">
      {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div>
        <label className="block text-sm font-medium">Nama venue</label>
        <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
      </div>

      <div>
        <label className="block text-sm font-medium">Alamat lengkap</label>
        <input required value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
      </div>

      <div>
        <label className="block text-sm font-medium">Tautan Google Maps (opsional)</label>
        <input type="url" value={mapsUrl} onChange={(e) => setMapsUrl(e.target.value)} className={inputClass} placeholder="https://maps.google.com/..." />
      </div>

      <div>
        <label className="block text-sm font-medium">Deskripsi</label>
        <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} />
      </div>

      <div>
        <label className="block text-sm font-medium">Fasilitas (pisahkan dengan koma)</label>
        <input value={facilities} onChange={(e) => setFacilities(e.target.value)} className={inputClass} placeholder="Toilet, Parkir, Kantin, Musala" />
      </div>

      <div>
        <label className="block text-sm font-medium">Foto venue</label>
        {photoUrls.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-3">
            {photoUrls.map((url) => (
              <div key={url} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="Foto venue" className="h-24 w-32 rounded object-cover" />
                <button type="button" onClick={() => setPhotoUrls((prev) => prev.filter((u) => u !== url))} className="absolute right-1 top-1 rounded bg-white/90 px-1.5 text-xs text-red-600">
                  Hapus
                </button>
              </div>
            ))}
          </div>
        )}
        <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => setNewPhotos(Array.from(e.target.files ?? []))} className="mt-2 block text-sm" />
        <p className="mt-1 text-xs text-slate-500">JPG, PNG, atau WebP, maksimal 2 MB per foto.</p>
      </div>

      <div>
        <label className="block text-sm font-medium">Gambar QRIS venue</label>
        {qrisUrl && (
          <div className="mt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrisUrl} alt="QRIS venue" className="h-40 w-40 rounded border object-contain" />
          </div>
        )}
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setNewQris(e.target.files?.[0] ?? null)} className="mt-2 block text-sm" />
        <p className="mt-1 text-xs text-slate-500">Venue tanpa QRIS tidak bisa dibooking. Untuk demo, pakai QRIS uji milikmu sendiri.</p>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        Venue aktif (tampil di pencarian)
      </label>

      <div className="flex gap-3">
        <button disabled={saving} className="rounded bg-brand-600 px-5 py-2 text-white hover:bg-brand-700 disabled:opacity-60">
          {saving ? "Menyimpan..." : "Simpan venue"}
        </button>
        <button type="button" onClick={() => router.push("/owner")} className="rounded border px-5 py-2 hover:bg-slate-100">
          Batal
        </button>
      </div>
    </form>
  );
}
