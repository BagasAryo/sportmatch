import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import ProfileForm from "@/components/profile-form";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Profil" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("full_name, phone").eq("id", user!.id).single();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-800">Edit profil</h1>
        <ProfileForm fullName={profile?.full_name ?? ""} phone={profile?.phone ?? ""} email={user!.email ?? ""} />
      </main>
      <SiteFooter />
    </div>
  );
}
