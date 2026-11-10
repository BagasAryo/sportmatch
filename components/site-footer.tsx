import Link from "next/link";

const columns = [
  {
    title: "Jelajahi",
    links: [
      ["Cari venue", "/"],
      ["Booking saya", "/bookings"],
    ],
  },
  {
    title: "Pemilik venue",
    links: [
      ["Daftar sebagai pemilik", "/register?as=owner"],
      ["Dashboard pemilik", "/owner"],
    ],
  },
  {
    title: "Akun",
    links: [
      ["Masuk", "/login"],
      ["Daftar", "/register"],
      ["Profil saya", "/profile"],
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <p className="text-lg font-bold text-brand-700">SportMatch</p>
          <p className="mt-2 max-w-xs text-sm text-slate-600">Platform digital untuk mencari dan booking fasilitas olahraga.</p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-semibold text-slate-800">{col.title}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {col.links.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-slate-600 hover:text-brand-600">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t">
        <p className="mx-auto max-w-5xl px-4 py-4 text-xs text-slate-500">&copy; {new Date().getFullYear()} SportMatch Technologies Inc. All rights reserved.</p>
      </div>
    </footer>
  );
}
