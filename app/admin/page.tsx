import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { rupiah } from "@/lib/format";

type Stat = { label: string; value: number; href?: string; highlight?: boolean };

export default async function AdminHome() {
  const supabase = await createClient();

  const count = async (table: string, filter?: (q: ReturnType<typeof base>) => ReturnType<typeof base>) => {
    const q = filter ? filter(base(table)) : base(table);
    const { count: c } = await q;
    return c ?? 0;
  };
  function base(table: string) {
    return supabase.from(table).select("id", { count: "exact", head: true });
  }

  const [users, owners, pendingOwners, venues, confirmed, pendingVerify, feeRows] = await Promise.all([
    count("profiles", (q) => q.eq("role", "user")),
    count("profiles", (q) => q.eq("role", "owner")),
    count("profiles", (q) => q.eq("role", "user").eq("owner_requested", true)),
    count("venues"),
    count("bookings", (q) => q.eq("status", "dikonfirmasi")),
    count("bookings", (q) => q.eq("status", "menunggu_verifikasi")),
    supabase.from("bookings").select("service_fee").eq("status", "dikonfirmasi"),
  ]);

  const revenue = (feeRows.data ?? []).reduce((sum, r) => sum + (r.service_fee as number), 0);

  const stats: Stat[] = [
    { label: "Pengguna", value: users },
    { label: "Pemilik venue", value: owners, href: "/admin/owners" },
    { label: "Pengajuan pemilik menunggu", value: pendingOwners, href: "/admin/owners", highlight: pendingOwners > 0 },
    { label: "Venue", value: venues, href: "/admin/venues" },
    { label: "Booking dikonfirmasi", value: confirmed, href: "/admin/bookings" },
    { label: "Menunggu verifikasi pemilik", value: pendingVerify, href: "/admin/bookings" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Ringkasan</h1>

      <div className="mt-5 rounded-xl bg-brand-600 p-6 text-white shadow-sm">
        <p className="text-sm text-brand-100">Pendapatan platform</p>
        <p className="mt-1 text-3xl font-bold">{rupiah(revenue)}</p>
        <p className="mt-1 text-xs text-brand-100">Jumlah biaya layanan dari booking yang sudah dikonfirmasi.</p>
      </div>

      <ul className="mt-5 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => {
          const cls = `block rounded-xl border p-4 shadow-sm ${s.highlight ? "border-accent-500 bg-accent-50" : "bg-white"} ${s.href ? "hover:border-brand-600" : ""}`;
          const body = (
            <>
              <p className="text-sm text-slate-600">{s.label}</p>
              <p className={`mt-1 text-2xl font-bold ${s.highlight ? "text-accent-600" : "text-slate-800"}`}>{s.value}</p>
            </>
          );
          return (
            <li key={s.label}>
              {s.href ? (
                <Link href={s.href} className={cls}>
                  {body}
                </Link>
              ) : (
                <div className={cls}>{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
