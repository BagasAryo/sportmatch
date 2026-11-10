import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "accent" | "outline" | "outlineLight" | "success" | "danger" | "outlineDanger";
type Size = "md" | "sm";

const base = "inline-flex items-center justify-center rounded-lg text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60";

const sizes: Record<Size, string> = {
  md: "px-5 py-2.5",
  sm: "px-3.5 py-1.5",
};

const variants: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-400",
  accent: "bg-accent-500 text-white hover:bg-accent-600 focus-visible:ring-accent-500",
  outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-brand-400",
  outlineLight: "border border-white/40 text-white hover:bg-white/10 focus-visible:ring-white",
  success: "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-600",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600",
  outlineDanger: "border border-red-300 bg-white text-red-700 hover:bg-red-50 focus-visible:ring-red-600",
};

// Dipakai juga untuk <Link> supaya tampilannya sama dengan tombol
export function buttonClass(variant: Variant = "primary", full = false, size: Size = "md") {
  return `${base} ${sizes[size]} ${variants[variant]} ${full ? "w-full" : ""}`;
}

export default function Button({ variant = "primary", size = "md", full = false, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; full?: boolean }) {
  return <button {...props} className={`${buttonClass(variant, full, size)} ${className}`} />;
}
