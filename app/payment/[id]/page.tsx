import { redirect } from "next/navigation";

// Alamat lama. Detail booking dan pembayaran sekarang ada di /bookings/[id].
export default async function PaymentRedirectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/bookings/${id}`);
}
