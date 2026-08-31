import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STATUS_LABEL, STATUS_COLOR } from "@/lib/booking-labels";

export default async function WorkerJobsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "RECRUITER") redirect("/dashboard/recruiter");
  if (!user.workerProfile) redirect("/register/worker");

  const jobs = await prisma.booking.findMany({
    where: { workerId: user.id, status: { in: ["ACCEPTED", "EN_ROUTE", "ARRIVED", "COMPLETED"] } },
    include: { recruiter: { select: { phone: true, recruiterProfile: true } } },
    orderBy: { updatedAt: "desc" },
  });

  const active = jobs.filter((b) => b.status !== "COMPLETED");
  const completed = jobs.filter((b) => b.status === "COMPLETED");

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900">
        My Jobs <span className="font-normal text-gray-400">मेरे काम</span>
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        {active.length} active &middot; {completed.length} completed
      </p>

      <JobSection title="Active" jobs={active} emptyText="No active jobs right now." />
      <div className="mt-6">
        <JobSection title="Completed" jobs={completed} emptyText="No completed jobs yet." />
      </div>
    </div>
  );
}

type JobRow = Awaited<ReturnType<typeof prisma.booking.findMany>>[number] & {
  recruiter: { phone: string; recruiterProfile: { fullName: string } | null };
};

function JobSection({
  title,
  jobs,
  emptyText,
}: {
  title: string;
  jobs: JobRow[];
  emptyText: string;
}) {
  return (
    <div className="mt-4">
      <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
      {jobs.length === 0 ? (
        <div className="mt-2 rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-400">
          {emptyText}
        </div>
      ) : (
        <ul className="mt-2 space-y-3">
          {jobs.map((b) => (
            <li key={b.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {b.recruiter.recruiterProfile?.fullName ?? "Recruiter"} — {b.skill}
                  </p>
                  <p className="text-xs text-gray-500">+91 {b.recruiter.phone}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLOR[b.status] ?? "bg-gray-100 text-gray-500"}`}
                >
                  {STATUS_LABEL[b.status] ?? b.status}
                </span>
              </div>
              <Link
                href={`/bookings/${b.id}`}
                className="mt-2 inline-block text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                View / track →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
