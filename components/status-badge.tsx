const STATUS: Record<string, { label: string; className: string }> = {
  menunggu_bayar: {
    label: "Menunggu pembayaran",
    className: "bg-amber-100 text-amber-800",
  },
  menunggu_verifikasi: {
    label: "Menunggu verifikasi",
    className: "bg-sky-100 text-sky-800",
  },
  dikonfirmasi: {
    label: "Dikonfirmasi",
    className: "bg-green-100 text-green-800",
  },
  ditolak: { label: "Ditolak", className: "bg-red-100 text-red-800" },
  dibatalkan: { label: "Dibatalkan", className: "bg-slate-200 text-slate-700" },
};

export default function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status] ?? {
    label: status,
    className: "bg-slate-200 text-slate-700",
  };
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${s.className}`}>{s.label}</span>;
}
