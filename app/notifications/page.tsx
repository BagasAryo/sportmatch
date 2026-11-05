import SiteHeader from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import NotificationList from "./notification-list";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const { data } = await supabase.from("notifications").select("id, message, link, is_read, created_at").eq("user_id", profile!.id).order("created_at", { ascending: false }).limit(50);

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-4 text-2xl font-bold text-slate-800">Notifikasi</h1>
        <NotificationList items={data ?? []} userId={profile!.id} />
      </main>
    </div>
  );
}
