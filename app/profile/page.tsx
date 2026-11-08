import SiteHeader from "@/components/site-header";
import ProfileForm from "@/components/profile-form";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("full_name, phone").eq("id", user!.id).single();

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-lg px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-800">Profil saya</h1>
        <ProfileForm fullName={profile?.full_name ?? ""} phone={profile?.phone ?? ""} email={user!.email ?? ""} />
      </main>
    </div>
  );
}
