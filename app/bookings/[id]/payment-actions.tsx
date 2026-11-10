"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { rupiah } from "@/lib/format";
import { useCountdown } from "./use-countdown";
import Button from "@/components/ui/button";
import Notice from "@/components/ui/notice";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

export default function PaymentActions({
  bookingId,
  userId,
  status,
  total,
  deadline,
  serverNow,
}: {
  bookingId: string;
  userId: string;
  status: string;
  total: number;
  // batas bayar (ms sejak epoch); null jika booking tidak sedang menunggu pembayaran
  deadline: number | null;
  // waktu server saat halaman dibuat (ms), untuk menyamakan jam server dan jam perangkat
  serverNow: number;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Hitung mundur ditampilkan di atas halaman (PaymentCountdown); di sini hanya
  // dipakai untuk menonaktifkan tombol kirim setelah waktu habis
  const remaining = useCountdown(deadline, serverNow);
  const expired = status === "menunggu_bayar" && remaining !== null && remaining <= 0;

  const canPay = status === "menunggu_bayar" || status === "menunggu_verifikasi";
  if (!canPay) return null;

  async function copyAmount() {
    try {
      await navigator.clipboard.writeText(String(total));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Gagal menyalin. Salin nominal secara manual.");
    }
  }

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (expired) return setError("Waktu pembayaran sudah habis");
    if (!file) return setError("Pilih gambar bukti pembayaran terlebih dahulu");
    if (!ALLOWED_TYPES.includes(file.type)) return setError("Format harus JPG, PNG, atau WebP");
    if (file.size > MAX_SIZE) return setError("Ukuran gambar maksimal 2 MB");

    setBusy(true);
    // Path mengikuti aturan storage: {user_id}/{booking_id}.jpg
    const path = `${userId}/${bookingId}.jpg`;
    const { error: upErr } = await supabase.storage.from("payment-proofs").upload(path, file, { contentType: file.type, upsert: true });
    if (upErr) {
      setBusy(false);
      return setError(upErr.message);
    }

    const { error: dbErr } = await supabase.from("bookings").update({ payment_proof_path: path, status: "menunggu_verifikasi" }).eq("id", bookingId);
    setBusy(false);
    if (dbErr) return setError(dbErr.message);

    setFile(null);
    router.push("/bookings");
    router.refresh();
  }

  async function handleCancel() {
    if (!confirm("Batalkan booking ini? Slot akan dilepaskan.")) return;
    setBusy(true);
    const { error: dbErr } = await supabase.from("bookings").update({ status: "dibatalkan" }).eq("id", bookingId);
    setBusy(false);
    if (dbErr) return setError(dbErr.message);
    router.push("/bookings");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {error && <Notice tone="error">{error}</Notice>}

      <div className="flex flex-wrap items-center gap-3 rounded border bg-brand-50 p-3 text-sm">
        <span>
          Nominal yang harus dibayar: <strong className="text-brand-700">{rupiah(total)}</strong>
        </span>
        <button type="button" onClick={copyAmount} className="rounded-lg border bg-white px-3 py-1.5 text-sm hover:bg-slate-100">
          {copied ? "Tersalin" : "Salin nominal"}
        </button>
      </div>

      <form onSubmit={handleUpload} className="space-y-3">
        <label htmlFor="proof" className="block text-sm font-medium text-slate-700">
          {status === "menunggu_bayar" ? "Unggah bukti pembayaran" : "Ganti bukti pembayaran (opsional)"}
        </label>
        <input
          id="proof"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100"
        />
        <p className="text-xs text-slate-500">Screenshot bukti transfer, JPG, PNG, atau WebP, maksimal 2 MB.</p>
        <Button disabled={busy || expired}>{busy ? "Memproses..." : "Kirim bukti pembayaran"}</Button>
      </form>

      <button type="button" onClick={handleCancel} disabled={busy} className="text-sm text-red-600 underline disabled:opacity-60">
        Batalkan booking
      </button>
    </div>
  );
}
