import { createClient } from "@/lib/supabase/server";
import NotificationBell from "@/components/notification-bell";

// Menghitung notifikasi belum dibaca di server, lalu menyerahkannya ke
// komponen lonceng (client) yang akan memperbarui angka secara realtime.
export default async function NotificationBellLoader({ userId }: { userId: string }) {
  const supabase = await createClient();
  const { count } = await supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("is_read", false);

  return <NotificationBell userId={userId} initialCount={count ?? 0} />;
}
