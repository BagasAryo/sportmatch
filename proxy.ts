// Next.js 16 memakai nama file proxy.ts.
// Jika versi Next.js kamu 15 atau lebih lama, ubah nama file menjadi
// middleware.ts dan nama fungsi menjadi "middleware".
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Halaman yang wajib login
const LOGIN_REQUIRED = ["/bookings", "/checkout", "/payment", "/notifications", "/profile", "/owner", "/admin"];

function matches(path: string, prefix: string) {
  return path === prefix || path.startsWith(prefix + "/");
}

// Redirect sambil membawa cookie sesi yang baru disegarkan
function redirectTo(request: NextRequest, base: NextResponse, pathname: string, search = "") {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = search;
  const res = NextResponse.redirect(url);
  base.cookies.getAll().forEach((c) => res.cookies.set(c));
  return res;
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
      },
    },
  });

  // Jangan menyisipkan kode lain antara createServerClient dan getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // 1. Belum login tapi membuka halaman yang butuh login
  if (!user && LOGIN_REQUIRED.some((p) => matches(path, p))) {
    return redirectTo(request, supabaseResponse, "/login", `?next=${encodeURIComponent(path)}`);
  }

  // 2. Sudah login tapi membuka halaman login/daftar
  if (user && (path === "/login" || path === "/register")) {
    return redirectTo(request, supabaseResponse, "/");
  }

  // 3. Pembatasan per peran untuk /admin dan /owner
  if (user && (matches(path, "/admin") || matches(path, "/owner"))) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const role = profile?.role;

    if (matches(path, "/admin") && role !== "admin") {
      return redirectTo(request, supabaseResponse, "/");
    }
    if (matches(path, "/owner") && role !== "owner" && role !== "admin") {
      return redirectTo(request, supabaseResponse, "/");
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
