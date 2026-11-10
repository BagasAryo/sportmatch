"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/button";
import Field from "@/components/ui/field";
import Input from "@/components/ui/input";
import Notice from "@/components/ui/notice";
import Textarea from "@/components/ui/textarea";

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

const sectionClass = "space-y-4 rounded-xl border bg-white p-6 shadow-sm";
const fileClass = "block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100";

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

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <Notice tone="error">{error}</Notice>}

      <section className={sectionClass}>
        <h2 className="font-semibold text-slate-800">Informasi dasar</h2>
        <Field label="Nama venue" htmlFor="name">
          <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Alamat lengkap" htmlFor="address">
          <Input id="address" required value={address} onChange={(e) => setAddress(e.target.value)} />
        </Field>
        <Field label="Tautan Google Maps (opsional)" htmlFor="maps">
          <Input id="maps" type="url" value={mapsUrl} onChange={(e) => setMapsUrl(e.target.value)} placeholder="https://maps.google.com/..." />
        </Field>
        <Field label="Deskripsi" htmlFor="description">
          <Textarea id="description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <Field label="Fasilitas" htmlFor="facilities" hint="Pisahkan dengan koma.">
          <Input id="facilities" value={facilities} onChange={(e) => setFacilities(e.target.value)} placeholder="Toilet, Parkir, Kantin, Musala" />
        </Field>
      </section>

      <section className={sectionClass}>
        <h2 className="font-semibold text-slate-800">Foto venue</h2>
        <Field label="Unggah foto" htmlFor="photos" hint="JPG, PNG, atau WebP, maksimal 2 MB per foto.">
          {photoUrls.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-3">
              {photoUrls.map((url) => (
                <div key={url} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="Foto venue" className="h-24 w-32 rounded-lg object-cover" />
                  <button type="button" onClick={() => setPhotoUrls((prev) => prev.filter((u) => u !== url))} className="absolute right-1 top-1 rounded-md bg-white/90 px-1.5 py-0.5 text-xs font-medium text-red-600 hover:bg-white">
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          )}
          <input id="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => setNewPhotos(Array.from(e.target.files ?? []))} className={fileClass} />
        </Field>
      </section>

      <section className={sectionClass}>
        <h2 className="font-semibold text-slate-800">QRIS pembayaran</h2>
        {!qrisUrl && !newQris && <Notice tone="warning">Venue tanpa QRIS tidak muncul di pencarian dan tidak bisa dibooking.</Notice>}
        <Field label="Gambar QRIS venue" htmlFor="qris" hint="Untuk demo, pakai QRIS uji milikmu sendiri.">
          {qrisUrl && (
            <div className="mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrisUrl} alt="QRIS venue" className="h-40 w-40 rounded-lg border object-contain" />
            </div>
          )}
          <input id="qris" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setNewQris(e.target.files?.[0] ?? null)} className={fileClass} />
        </Field>
      </section>

      <section className={sectionClass}>
        <h2 className="font-semibold text-slate-800">Status</h2>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 accent-brand-600" />
          Venue aktif (tampil di pencarian)
        </label>
      </section>

      <div className="flex gap-3">
        <Button disabled={saving}>{saving ? "Menyimpan..." : "Simpan venue"}</Button>
        <Button type="button" variant="outline" onClick={() => router.push("/owner")}>
          Batal
        </Button>
      </div>
    </form>
  );
}
