import type { SelectHTMLAttributes } from "react";

// Panah dibuat dengan background CSS, jadi tidak butuh ikon/package
const chevron =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>\")";

export default function Select({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      style={{
        backgroundImage: chevron,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 0.75rem center",
      }}
      className={`w-full appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pl-3 pr-10 text-slate-800 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-slate-100 ${className}`}
    >
      {children}
    </select>
  );
}
