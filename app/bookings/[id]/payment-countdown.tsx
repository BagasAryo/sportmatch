"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCountdown } from "./use-countdown";

// 272000 -> "04:32"
function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(Math.ceil(ms / 1000), 0);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function PaymentCountdown({ bookingId, deadline, serverNow }: { bookingId: string; deadline: number | null; serverNow: number }) {
  const router = useRouter();
  const remaining = useCountdown(deadline, serverNow);
  const expired = remaining !== null && remaining <= 0;

  // Setelah waktu habis, cek status booking tiap 5 detik lewat query ringan.
  // Halaman baru dimuat ulang (sekali) ketika status sudah berubah dari menunggu_bayar.
  useEffect(() => {
    if (!expired) return;
    const supabase = createClient();
    let active = true;
    const timer = setInterval(async () => {
      const { data } = await supabase.from("bookings").select("status").eq("id", bookingId).single();
      if (active && data && data.status !== "menunggu_bayar") {
        active = false;
        clearInterval(timer);
        router.refresh();
      }
    }, 5000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [expired, bookingId, router]);

  if (remaining === null) return null;

  return (
    <div className={`rounded-lg px-4 py-3 text-sm ${expired || remaining < 60_000 ? "bg-red-50 text-red-800" : "bg-accent-50 text-accent-600"}`}>
      {expired ? (
        "Waktu pembayaran habis. Booking akan segera dibatalkan otomatis."
      ) : (
        <>
          Selesaikan pembayaran dalam <strong>{formatCountdown(remaining)}</strong>. Setelah itu booking dibatalkan otomatis.
        </>
      )}
    </div>
  );
}
