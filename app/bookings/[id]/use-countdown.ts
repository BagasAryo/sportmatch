"use client";

import { useEffect, useState } from "react";

// Sisa waktu dalam milidetik sampai batas bayar; null jika tidak ada batas waktu.
// serverNow dipakai untuk menyamakan jam server dengan jam perangkat.
export function useCountdown(deadline: number | null, serverNow: number): number | null {
  const [remaining, setRemaining] = useState<number | null>(deadline === null ? null : deadline - serverNow);

  useEffect(() => {
    if (deadline === null) return;
    const offset = serverNow - Date.now();
    const timer = setInterval(() => setRemaining(deadline - (Date.now() + offset)), 1000);
    return () => clearInterval(timer);
  }, [deadline, serverNow]);

  return deadline === null ? null : remaining;
}
