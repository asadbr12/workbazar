import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import RecruiterDashboardSidebar from "@/components/RecruiterDashboardSidebar";

export default async function RecruiterDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "WORKER") redirect("/dashboard/worker");
  if (!user.recruiterProfile) redirect("/register/recruiter");

  const pendingBookingCount = await prisma.booking.count({
    where: { recruiterId: user.id, status: "REQUESTED" },
  });

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <RecruiterDashboardSidebar pendingBookingCount={pendingBookingCount} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
