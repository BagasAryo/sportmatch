"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createBooking(formData: FormData) {
  const courtId = String(formData.get("court") ?? "");
  const date = String(formData.get("date") ?? "");
  const start = String(formData.get("start") ?? "");
  const end = String(formData.get("end") ?? "");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Harga, biaya layanan, status, dan user_id diisi oleh trigger di database
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      court_id: courtId,
      booking_date: date,
      start_time: start,
      end_time: end,
    })
    .select("id")
    .single();

  if (error || !data) {
    const message = error?.code === "23P01" ? "Jam ini baru saja dibooking orang lain. Silakan pilih jam lain." : (error?.message ?? "Booking gagal dibuat");
    const q = new URLSearchParams({
      court: courtId,
      date,
      start,
      end,
      error: message,
    });
    redirect(`/checkout?${q.toString()}`);
  }

  redirect(`/bookings/${data.id}`);
}
