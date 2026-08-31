import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUnreadInboxCount } from "@/lib/inbox";
import WorkerDashboardSidebar from "@/components/WorkerDashboardSidebar";

export default async function WorkerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "RECRUITER") redirect("/dashboard/recruiter");
  if (!user.workerProfile) redirect("/register/worker");

  const [bookingRequestCount, unreadInboxCount] = await Promise.all([
    prisma.booking.count({ where: { workerId: user.id, status: "REQUESTED" } }),
    getUnreadInboxCount(user.id, "WORKER"),
  ]);

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <WorkerDashboardSidebar
        bookingRequestCount={bookingRequestCount}
        unreadInboxCount={unreadInboxCount}
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
