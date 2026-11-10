import { createClient } from "@/lib/supabase/server";
import OwnerActions from "./owner-actions";

export default async function AdminOwnersPage() {
  const supabase = await createClient();

  const { data: pending } = await supabase.from("profiles").select("id, full_name, phone, created_at").eq("role", "user").eq("owner_requested", true).order("created_at", { ascending: false });

  const { data: owners } = await supabase.from("profiles").select("id, full_name, phone, created_at").eq("role", "owner").order("created_at", { ascending: false });

  const date = (iso: string) =>
    new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const pendingCount = pending?.length ?? 0;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-800">Pemilik venue</h1>

      <h2 className="mb-3 mt-6 flex items-center gap-2 text-lg font-semibold text-slate-800">
        Pengajuan menunggu persetujuan
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${pendingCount > 0 ? "bg-accent-500 text-white" : "bg-slate-200 text-slate-600"}`}>{pendingCount}</span>
      </h2>
      {!pending || pending.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-white p-6 text-center text-sm text-slate-500">Tidak ada pengajuan baru.</div>
      ) : (
        <ul className="space-y-3">
          {pending.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-l-4 border-l-accent-500 bg-white p-4 shadow-sm">
              <div>
                <p className="font-semibold text-slate-800">{p.full_name || "(tanpa nama)"}</p>
                <p className="text-sm text-slate-600">
                  {p.phone || "Nomor HP belum diisi"} &middot; mendaftar {date(p.created_at)}
                </p>
              </div>
              <OwnerActions userId={p.id} />
            </li>
          ))}
        </ul>
      )}

      <h2 className="mb-3 mt-8 flex items-center gap-2 text-lg font-semibold text-slate-800">
        Pemilik venue aktif
        <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-600">{owners?.length ?? 0}</span>
      </h2>
      {!owners || owners.length === 0 ? (
        <p className="text-sm text-slate-500">Belum ada pemilik venue.</p>
      ) : (
        <ul className="space-y-2">
          {owners.map((o) => (
            <li key={o.id} className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="font-medium text-slate-800">{o.full_name || "(tanpa nama)"}</p>
              <p className="text-sm text-slate-600">
                {o.phone || "Nomor HP belum diisi"} &middot; sejak {date(o.created_at)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
