"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { rupiah } from "@/lib/format";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

export default function PaymentActions({ bookingId, userId, status, total }: { bookingId: string; userId: string; status: string; total: number }) {
  const router = useRouter();
  const supabase = createClient();

  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

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
    router.push('/bookings');
    router.refresh();
  }

  async function handleCancel() {
    if (!confirm("Batalkan booking ini? Slot akan dilepaskan.")) return;
    setBusy(true);
    const { error: dbErr } = await supabase.from("bookings").update({ status: "dibatalkan" }).eq("id", bookingId);
    setBusy(false);
    if (dbErr) return setError(dbErr.message);
    router.push('/bookings');
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="flex flex-wrap items-center gap-3 rounded border bg-brand-50 p-3 text-sm">
        <span>
          Nominal yang harus dibayar: <strong className="text-brand-700">{rupiah(total)}</strong>
        </span>
        <button type="button" onClick={copyAmount} className="rounded border bg-white px-3 py-1 hover:bg-slate-100">
          {copied ? "Tersalin" : "Salin nominal"}
        </button>
      </div>

      <form onSubmit={handleUpload} className="space-y-3">
        <label className="block text-sm font-medium">{status === "menunggu_bayar" ? "Unggah bukti pembayaran" : "Ganti bukti pembayaran (opsional)"}</label>
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="block text-sm" />
        <p className="text-xs text-slate-500">Screenshot bukti transfer, JPG, PNG, atau WebP, maksimal 2 MB.</p>
        <button disabled={busy} className="rounded bg-brand-600 px-5 py-2 text-white hover:bg-brand-700 disabled:opacity-60">
          {busy ? "Memproses..." : "Kirim bukti pembayaran"}
        </button>
      </form>

      <button type="button" onClick={handleCancel} disabled={busy} className="text-sm text-red-600 underline disabled:opacity-60">
        Batalkan booking
      </button>
    </div>
  );
}
