"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProfileState = { error?: string; success?: boolean };

export async function updateProfile(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (fullName.length < 2) return { error: "Nama minimal 2 karakter" };
  if (phone && !/^(\+62|62|0)8[0-9]{0,12}$/.test(phone)) {
    return { error: "Nomor HP tidak valid (contoh: 081234567890)" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Kamu belum login" };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, phone: phone || null })
    .eq("id", user.id);

  if (error) return { error: "Gagal menyimpan profil, coba lagi" };

  revalidatePath("/", "layout"); // nama di header ikut berubah
  return { success: true };
}
