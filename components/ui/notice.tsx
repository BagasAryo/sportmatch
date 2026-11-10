import type { ReactNode } from "react";

type Tone = "info" | "success" | "error" | "warning" | "neutral";

const tones: Record<Tone, string> = {
  info: "bg-brand-50 text-brand-700",
  success: "bg-green-50 text-green-800",
  error: "bg-red-50 text-red-800",
  warning: "bg-accent-50 text-accent-600",
  neutral: "bg-slate-100 text-slate-700",
};

export default function Notice({ tone = "info", className = "", children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return (
    <div role={tone === "error" ? "alert" : undefined} className={`rounded-lg px-4 py-3 text-sm ${tones[tone]} ${className}`}>
      {children}
    </div>
  );
}
