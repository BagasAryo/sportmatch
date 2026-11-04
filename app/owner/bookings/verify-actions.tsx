"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function VerifyActions({ bookingId, proofPath }: { bookingId: string; proofPath: string | null }) {
  const router = useRouter();
  const supabase = createClient();

  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function showProof() {
    setError("");
    if (!proofPath) return setError("Bukti pembayaran belum diunggah");
    // Bucket privat: buat tautan sementara (5 menit)
    const { data, error: signErr } = await supabase.storage.from("payment-proofs").createSignedUrl(proofPath, 300);
    if (signErr || !data) return setError("Gagal membuka bukti pembayaran");
    setProofUrl(data.signedUrl);
  }

  async function confirmBooking() {
    if (!confirm("Konfirmasi pembayaran ini? Pastikan nominal sudah masuk.")) return;
    setBusy(true);
    const { error: dbErr } = await supabase.from("bookings").update({ status: "dikonfirmasi" }).eq("id", bookingId);
    setBusy(false);
    if (dbErr) return setError(dbErr.message);
    router.refresh();
  }

  async function rejectBooking() {
    if (!note.trim()) return setError("Tulis alasan penolakan");
    setBusy(true);
    const { error: dbErr } = await supabase.from("bookings").update({ status: "ditolak", rejection_note: note.trim() }).eq("id", bookingId);
    setBusy(false);
    if (dbErr) return setError(dbErr.message);
    router.refresh();
  }

  return (
    <div className="mt-3 space-y-3">
      {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {proofUrl && (
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={proofUrl} alt="Bukti pembayaran" className="max-h-96 rounded border object-contain" />
        </div>
      )}

      {!rejecting ? (
        <div className="flex flex-wrap gap-2 text-sm">
          <button onClick={showProof} className="rounded border px-3 py-1.5 hover:bg-slate-100">
            {proofUrl ? "Muat ulang bukti" : "Lihat bukti pembayaran"}
          </button>
          <button onClick={confirmBooking} disabled={busy} className="rounded bg-green-600 px-3 py-1.5 text-white hover:bg-green-700 disabled:opacity-60">
            Konfirmasi
          </button>
          <button onClick={() => setRejecting(true)} disabled={busy} className="rounded border border-red-300 px-3 py-1.5 text-red-700 hover:bg-red-50">
            Tolak
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Alasan penolakan (misalnya nominal tidak sesuai)"
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
          />
          <div className="flex gap-2 text-sm">
            <button onClick={rejectBooking} disabled={busy} className="rounded bg-red-600 px-3 py-1.5 text-white hover:bg-red-700 disabled:opacity-60">
              Kirim penolakan
            </button>
            <button onClick={() => setRejecting(false)} className="rounded border px-3 py-1.5 hover:bg-slate-100">
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
