import DashboardShell from "@/components/dashboard-shell";

export const metadata = { title: "Pemilik Venue" };

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell role="owner">{children}</DashboardShell>;
}
