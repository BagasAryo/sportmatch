"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ReviewForm({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (rating < 1) return setError("Pilih rating 1 sampai 5 bintang");

    setBusy(true);
    // user_id dan venue_id diisi trigger di database; trigger juga memastikan
    // booking milik kamu, sudah dikonfirmasi, dan waktunya sudah selesai
    const { error: dbErr } = await supabase.from("reviews").insert({
      booking_id: bookingId,
      rating,
      comment: comment.trim() || null,
    });
    setBusy(false);

    if (dbErr) {
      return setError(dbErr.code === "23505" ? "Kamu sudah memberi ulasan untuk booking ini" : dbErr.message);
    }
    router.refresh();
  }

  const shown = hover || rating;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div>
        <p className="text-sm font-medium text-slate-700">Rating kamu</p>
        <div className="mt-1 flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" aria-label={`${n} bintang`} onMouseEnter={() => setHover(n)} onClick={() => setRating(n)} className={`text-3xl leading-none ${n <= shown ? "text-accent-500" : "text-slate-300"}`}>
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Komentar (opsional)</label>
        <textarea
          rows={3}
          maxLength={500}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Ceritakan pengalamanmu di venue ini"
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
        />
      </div>

      <button disabled={busy} className="rounded bg-brand-600 px-5 py-2 text-white hover:bg-brand-700 disabled:opacity-60">
        {busy ? "Mengirim..." : "Kirim ulasan"}
      </button>
    </form>
  );
}
