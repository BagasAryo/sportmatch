import Link from "next/link";
import SiteHeader from "@/components/site-header";
import Notice from "@/components/ui/notice";
import { buttonClass } from "@/components/ui/button";

export default function ProblemPage({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-xl px-4 py-10">
        <Notice tone="warning">{message}</Notice>
        <Link href="/" className={`${buttonClass("outline")} mt-4`}>
          Kembali ke beranda
        </Link>
      </main>
    </div>
  );
}
