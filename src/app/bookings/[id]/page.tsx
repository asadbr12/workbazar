import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import BookingTracker from "@/components/BookingTracker";

export default async function BookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect(`/login?next=${encodeURIComponent(`/bookings/${id}`)}`);

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      recruiter: { select: { id: true, phone: true, recruiterProfile: true } },
      worker: { select: { id: true, phone: true, workerProfile: true } },
    },
  });

  if (!booking) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center text-sm text-gray-500">
        Booking not found.
      </div>
    );
  }

  if (booking.recruiterId !== session.userId && booking.workerId !== session.userId) {
    redirect("/");
  }

  const viewerRole = booking.recruiterId === session.userId ? "RECRUITER" : "WORKER";

  return <BookingTracker initialBooking={booking} viewerRole={viewerRole} />;
}
