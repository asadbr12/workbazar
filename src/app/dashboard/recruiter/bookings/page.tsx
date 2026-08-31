import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RECRUITER_STATUS_LABEL, STATUS_COLOR } from "@/lib/booking-labels";

export default async function RecruiterBookingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "WORKER") redirect("/dashboard/worker");
  if (!user.recruiterProfile) redirect("/register/recruiter");

  const bookings = await prisma.booking.findMany({
    where: { recruiterId: user.id },
    include: { worker: { select: { phone: true, workerProfile: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900">My Bookings</h1>
      <p className="mt-1 text-sm text-gray-500">
        {bookings.length} booking{bookings.length === 1 ? "" : "s"} total.
      </p>

      {bookings.length === 0 ? (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-8 text-center">
          <span className="text-3xl">📅</span>
          <p className="mt-2 text-sm font-semibold text-gray-700">No bookings yet</p>
          <p className="mt-0.5 text-xs text-gray-400">
            Search a skill to find and book a worker.
          </p>
          <Link
            href="/search"
            className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Find Workers
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {bookings.map((b) => (
            <li key={b.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {b.worker.workerProfile?.fullName ?? "Worker"} — {b.skill}
                  </p>
                  <p className="text-xs text-gray-500">+91 {b.worker.phone}</p>
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
                  {RECRUITER_STATUS_LABEL[b.status] ?? b.status}
                </span>
              </div>
              <Link
                href={`/bookings/${b.id}`}
                className="mt-2 inline-block text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Track →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
