export function rupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

// Tanggal hari ini di WIB dalam format YYYY-MM-DD
export function todayWIB(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Jakarta" });
}

// 19 -> "19:00"
export function hourLabel(h: number): string {
  return `${String(h).padStart(2, "0")}:00`;
}

// "2026-11-05" -> "Kamis, 5 November 2026"
export function formatDateID(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
