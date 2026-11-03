import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import VenueForm from "@/app/owner/venues/venue-form";

export default async function NewVenuePage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const { data: districts } = await supabase.from("districts").select("id, name, cities(name)").order("name");

  return (
    <div className="max-w-2xl">
      <h1 className="mb-4 text-2xl font-bold text-slate-800">Tambah venue</h1>
      <VenueForm ownerId={profile!.id} districts={districts ?? []} />
    </div>
  );
}
