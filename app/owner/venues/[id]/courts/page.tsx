import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { CourtForm, CourtRow } from "./courts-client";

export default async function CourtsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const { data: venue } = await supabase.from("venues").select("id, name, owner_id").eq("id", id).single();

  if (!venue || (venue.owner_id !== profile!.id && profile!.role !== "admin")) {
    notFound();
  }

  const { data: courts } = await supabase.from("courts").select("id, name, sport_type_id, open_time, close_time, price_per_hour, is_active, sport_types(name)").eq("venue_id", id).order("name");

  const { data: sportTypes } = await supabase.from("sport_types").select("id, name").order("name");

  return (
    <div className="max-w-2xl">
      <Link href="/owner" className="text-sm text-brand-600 underline">
        &larr; Kembali ke venue saya
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-slate-800">Lapangan: {venue.name}</h1>

      <ul className="mt-6 space-y-3">
        {courts && courts.length > 0 ? (
          courts.map((c) => <CourtRow key={c.id} court={c} venueId={id} sportTypes={sportTypes ?? []} />)
        ) : (
          <li className="rounded border border-dashed bg-white p-6 text-center text-slate-500">Belum ada lapangan. Tambahkan di bawah.</li>
        )}
      </ul>

      <h2 className="mb-3 mt-8 text-lg font-semibold text-slate-800">Tambah lapangan</h2>
      <div className="rounded-lg border bg-white p-6">
        <CourtForm venueId={id} sportTypes={sportTypes ?? []} />
      </div>
    </div>
  );
}
