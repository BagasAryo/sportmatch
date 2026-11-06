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

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-800">Pemilik venue</h1>

      <h2 className="mb-3 mt-6 text-lg font-semibold text-slate-800">Pengajuan menunggu persetujuan ({pending?.length ?? 0})</h2>
      {!pending || pending.length === 0 ? (
        <p className="rounded border border-dashed bg-white p-6 text-center text-sm text-slate-500">Tidak ada pengajuan baru.</p>
      ) : (
        <ul className="space-y-3">
          {pending.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-4">
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

      <h2 className="mb-3 mt-8 text-lg font-semibold text-slate-800">Pemilik venue aktif ({owners?.length ?? 0})</h2>
      {!owners || owners.length === 0 ? (
        <p className="text-sm text-slate-500">Belum ada pemilik venue.</p>
      ) : (
        <ul className="space-y-2">
          {owners.map((o) => (
            <li key={o.id} className="rounded-lg border bg-white p-4">
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
