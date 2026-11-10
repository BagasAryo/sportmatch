import { createClient } from "@/lib/supabase/server";
import { rupiah } from "@/lib/format";
import { AddSportForm, ServiceFeeForm } from "./master-forms";

export default async function AdminMasterPage() {
  const supabase = await createClient();

  const [{ data: sports }, { data: fee }] = await Promise.all([supabase.from("sport_types").select("id, name").order("name"), supabase.from("app_settings").select("value").eq("key", "service_fee").maybeSingle()]);

  const currentFee: number = fee?.value ?? 5000;

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Data master</h1>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-800">Biaya layanan booking</h2>
        <p className="mb-4 mt-1 text-sm text-slate-600">Saat ini {rupiah(currentFee)} per booking. Perubahan hanya berlaku untuk booking baru; booking lama tetap memakai nominal saat dibuat.</p>
        <ServiceFeeForm initial={currentFee} />
      </section>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-800">Jenis olahraga ({sports?.length ?? 0})</h2>
        {sports && sports.length > 0 ? (
          <div className="mb-4 mt-3 flex flex-wrap gap-2">
            {sports.map((s) => (
              <span key={s.id} className="rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
                {s.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="mb-4 mt-1 text-sm text-slate-600">Belum ada data.</p>
        )}
        <AddSportForm />
      </section>
    </div>
  );
}
