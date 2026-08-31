import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StarRating from "@/components/StarRating";

export default async function RecruiterReviewsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "WORKER") redirect("/dashboard/worker");
  if (!user.recruiterProfile) redirect("/register/recruiter");

  const reviews = await prisma.booking.findMany({
    where: { recruiterId: user.id, rating: { not: null } },
    include: { worker: { select: { workerProfile: true } } },
    orderBy: { ratedAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900">Reviews</h1>
      <p className="mt-1 text-sm text-gray-500">Ratings you&apos;ve given to workers.</p>

      {reviews.length === 0 ? (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-8 text-center">
          <span className="text-3xl">⭐</span>
          <p className="mt-2 text-sm font-semibold text-gray-700">No reviews yet</p>
          <p className="mt-0.5 text-xs text-gray-400">
            Rate a worker after a completed booking and it&apos;ll show up here.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {reviews.map((b) => (
            <li key={b.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-gray-900">
                  {b.worker.workerProfile?.fullName ?? "Worker"} — {b.skill}
                </p>
                <StarRating avg={b.rating ?? 0} count={1} />
              </div>
              {b.ratingComment && (
                <p className="mt-1.5 text-sm text-gray-600">&ldquo;{b.ratingComment}&rdquo;</p>
              )}
              {b.ratedAt && (
                <p className="mt-1 text-xs text-gray-400">
                  {new Date(b.ratedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
