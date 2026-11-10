"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/button";
import Notice from "@/components/ui/notice";
import Textarea from "@/components/ui/textarea";

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
      {error && <Notice tone="error">{error}</Notice>}

      {proofUrl && (
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={proofUrl} alt="Bukti pembayaran" className="max-h-96 rounded-lg border object-contain" />
        </div>
      )}

      {!rejecting ? (
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={showProof}>
            {proofUrl ? "Muat ulang bukti" : "Lihat bukti pembayaran"}
          </Button>
          <Button type="button" variant="success" size="sm" onClick={confirmBooking} disabled={busy}>
            Konfirmasi
          </Button>
          <Button type="button" variant="outlineDanger" size="sm" onClick={() => setRejecting(true)} disabled={busy}>
            Tolak
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Alasan penolakan (misalnya nominal tidak sesuai)" aria-label="Alasan penolakan" />
          <div className="flex gap-2">
            <Button type="button" variant="danger" size="sm" onClick={rejectBooking} disabled={busy}>
              Kirim penolakan
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setRejecting(false)}>
              Batal
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
