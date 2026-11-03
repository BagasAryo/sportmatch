import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import VenueForm from "@/app/owner/venues/venue-form";

export default async function EditVenuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const { data: venue } = await supabase.from("venues").select("*").eq("id", id).single();

  // Hanya pemilik venue itu sendiri (atau admin) yang boleh mengedit
  if (!venue || (venue.owner_id !== profile!.id && profile!.role !== "admin")) {
    notFound();
  }

  const { data: districts } = await supabase.from("districts").select("id, name, cities(name)").order("name");

  return (
    <div className="max-w-2xl">
      <h1 className="mb-4 text-2xl font-bold text-slate-800">Edit venue</h1>
      <VenueForm ownerId={venue.owner_id} districts={districts ?? []} venue={venue} />
    </div>
  );
}
