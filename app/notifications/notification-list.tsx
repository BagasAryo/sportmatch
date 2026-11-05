"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { timeAgo } from "@/lib/format";

export type NotificationItem = {
  id: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

export default function NotificationList({ items, userId }: { items: NotificationItem[]; userId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [busy, setBusy] = useState(false);

  const unread = items.filter((i) => !i.is_read).length;

  async function openItem(item: NotificationItem) {
    if (!item.is_read) {
      await supabase.from("notifications").update({ is_read: true }).eq("id", item.id);
    }
    if (item.link) router.push(item.link);
    router.refresh();
  }

  async function markAllRead() {
    setBusy(true);
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false);
    setBusy(false);
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">{unread > 0 ? `${unread} belum dibaca` : "Semua sudah dibaca"}</p>
        {unread > 0 && (
          <button onClick={markAllRead} disabled={busy} className="rounded border px-3 py-1 text-sm hover:bg-slate-100 disabled:opacity-60">
            Tandai semua sudah dibaca
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="mt-4 rounded border border-dashed bg-white p-8 text-center text-slate-500">Belum ada notifikasi.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <button type="button" onClick={() => openItem(item)} className={`flex w-full items-start gap-3 rounded-lg border p-4 text-left hover:border-brand-600 ${item.is_read ? "bg-white" : "border-brand-100 bg-brand-50"}`}>
                <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${item.is_read ? "bg-transparent" : "bg-accent-500"}`} />
                <span>
                  <span className={`block text-sm ${item.is_read ? "text-slate-700" : "font-semibold text-slate-900"}`}>{item.message}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">{timeAgo(item.created_at)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
