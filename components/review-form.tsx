"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/button";
import Field from "@/components/ui/field";
import Notice from "@/components/ui/notice";
import Textarea from "@/components/ui/textarea";

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
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Notice tone="error">{error}</Notice>}

      <div>
        <p className="text-sm font-medium text-slate-700">Rating kamu</p>
        <div className="mt-1 flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" aria-label={`${n} bintang`} onMouseEnter={() => setHover(n)} onClick={() => setRating(n)} className={`text-3xl leading-none transition ${n <= shown ? "text-accent-500" : "text-slate-300"}`}>
              ★
            </button>
          ))}
        </div>
      </div>

      <Field label="Komentar (opsional)" htmlFor="comment">
        <Textarea id="comment" rows={3} maxLength={500} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Ceritakan pengalamanmu di venue ini" />
      </Field>

      <Button disabled={busy}>{busy ? "Mengirim..." : "Kirim ulasan"}</Button>
    </form>
  );
}
