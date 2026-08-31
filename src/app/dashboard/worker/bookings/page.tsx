import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STATUS_LABEL, STATUS_COLOR } from "@/lib/booking-labels";

export default async function WorkerBookingRequestsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "RECRUITER") redirect("/dashboard/recruiter");
  if (!user.workerProfile) redirect("/register/worker");

  const requests = await prisma.booking.findMany({
    where: { workerId: user.id, status: "REQUESTED" },
    include: { recruiter: { select: { phone: true, recruiterProfile: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900">
        Booking Requests <span className="font-normal text-gray-400">बुकिंग अनुरोध</span>
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        {requests.length} request{requests.length === 1 ? "" : "s"} waiting for your response.
      </p>

      {requests.length === 0 ? (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-8 text-center">
          <span className="text-3xl">📋</span>
          <p className="mt-2 text-sm font-semibold text-gray-700">No booking requests yet</p>
          <p className="mt-0.5 text-xs text-gray-400">
            When someone needs your skill, you&apos;ll see it here.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {requests.map((b) => (
            <li key={b.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {b.recruiter.recruiterProfile?.fullName ?? "Recruiter"} — {b.skill}
                  </p>
                  <p className="text-xs text-gray-500">+91 {b.recruiter.phone}</p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {new Date(b.createdAt).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
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
                Respond →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
