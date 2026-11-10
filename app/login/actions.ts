"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");

  // Cegah open redirect: hanya izinkan path internal
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  // Tanpa tujuan khusus: owner dan admin langsung ke dashboard masing-masing
  if (safeNext === "/") {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
    if (profile?.role === "admin") redirect("/admin");
    if (profile?.role === "owner") redirect("/owner");
  }

  redirect(safeNext);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
