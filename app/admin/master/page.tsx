import { createClient } from "@/lib/supabase/server";
import { first } from "@/lib/utils";
import { rupiah } from "@/lib/format";
import { AddCityForm, AddDistrictForm, AddSportForm, ServiceFeeForm } from "./master-forms";

export default async function AdminMasterPage() {
  const supabase = await createClient();

  const [{ data: cities }, { data: districts }, { data: sports }, { data: fee }] = await Promise.all([
    supabase.from("cities").select("id, name").order("name"),
    supabase.from("districts").select("id, name, cities(name)").order("name"),
    supabase.from("sport_types").select("id, name").order("name"),
    supabase.from("app_settings").select("value").eq("key", "service_fee").maybeSingle(),
  ]);

  const currentFee: number = fee?.value ?? 5000;

  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="text-2xl font-bold text-slate-800">Data master</h1>

      <section className="rounded-lg border bg-white p-5">
        <h2 className="font-semibold text-slate-800">Biaya layanan booking</h2>
        <p className="mb-3 mt-1 text-sm text-slate-600">Saat ini {rupiah(currentFee)} per booking. Perubahan hanya berlaku untuk booking baru; booking lama tetap memakai nominal saat dibuat.</p>
        <ServiceFeeForm initial={currentFee} />
      </section>

      <section className="rounded-lg border bg-white p-5">
        <h2 className="font-semibold text-slate-800">Kota ({cities?.length ?? 0})</h2>
        <p className="mb-3 mt-1 text-sm text-slate-600">{(cities ?? []).map((c) => c.name).join(", ") || "Belum ada kota."}</p>
        <AddCityForm />
      </section>

      <section className="rounded-lg border bg-white p-5">
        <h2 className="font-semibold text-slate-800">Kecamatan ({districts?.length ?? 0})</h2>
        <p className="mb-3 mt-1 text-sm text-slate-600">{(districts ?? []).map((d) => `${d.name} (${first(d.cities)?.name})`).join(", ") || "Belum ada kecamatan."}</p>
        <AddDistrictForm cities={cities ?? []} />
      </section>

      <section className="rounded-lg border bg-white p-5">
        <h2 className="font-semibold text-slate-800">Jenis olahraga ({sports?.length ?? 0})</h2>
        <p className="mb-3 mt-1 text-sm text-slate-600">{(sports ?? []).map((s) => s.name).join(", ") || "Belum ada data."}</p>
        <AddSportForm />
      </section>
    </div>
  );
}
