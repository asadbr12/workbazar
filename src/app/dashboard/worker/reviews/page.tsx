import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWorkerRatingStats } from "@/lib/ratings";
import StarRating from "@/components/StarRating";

export default async function WorkerReviewsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "RECRUITER") redirect("/dashboard/recruiter");
  if (!user.workerProfile) redirect("/register/worker");

  const [ratingStats, reviews] = await Promise.all([
    getWorkerRatingStats([user.id]),
    prisma.booking.findMany({
      where: { workerId: user.id, rating: { not: null } },
      include: { recruiter: { select: { recruiterProfile: true } } },
      orderBy: { ratedAt: "desc" },
    }),
  ]);

  const myRating = ratingStats[user.id] ?? { avg: 0, count: 0 };

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900">
        Reviews <span className="font-normal text-gray-400">समीक्षाएं</span>
      </h1>
      <div className="mt-2">
        <StarRating avg={myRating.avg} count={myRating.count} size="md" />
      </div>

      {reviews.length === 0 ? (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-8 text-center">
          <span className="text-3xl">⭐</span>
          <p className="mt-2 text-sm font-semibold text-gray-700">No reviews yet</p>
          <p className="mt-0.5 text-xs text-gray-400">
            Reviews from recruiters will show up here after you complete jobs.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {reviews.map((b) => (
            <li key={b.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-gray-900">
                  {b.recruiter.recruiterProfile?.fullName ?? "Recruiter"} — {b.skill}
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
