import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AVAILABILITY_LABELS, SKILL_GROUPS, SKILL_OPTIONS } from "@/lib/validation";
import { findNearbyWorkers, DEFAULT_SEARCH_RADIUS_KM } from "@/lib/workers";
import { formatFee } from "@/lib/format";
import BookNowButton from "@/components/BookNowButton";
import StarRating from "@/components/StarRating";

export default async function WorkersBySkillPage({
  params,
}: {
  params: Promise<{ skill: string }>;
}) {
  const { skill: skillParam } = await params;
  const skill = decodeURIComponent(skillParam);
  const next = `/workers/${encodeURIComponent(skill)}`;

  const user = await getCurrentUser();
  if (!user) redirect(`/signup?role=RECRUITER&next=${encodeURIComponent(next)}`);
  if (!user.role) redirect(`/signup?next=${encodeURIComponent(next)}`);
  if (user.role === "RECRUITER" && !user.recruiterProfile) {
    redirect(`/register/recruiter?next=${encodeURIComponent(next)}`);
  }

  const isValidSkill = (SKILL_OPTIONS as readonly string[]).includes(skill);
  const parentGroup = SKILL_GROUPS.find((g) =>
    (g.skills as readonly string[]).includes(skill)
  );

  const origin =
    user.recruiterProfile?.lat != null && user.recruiterProfile?.lng != null
      ? { lat: user.recruiterProfile.lat, lng: user.recruiterProfile.lng }
      : null;

  const { workers } = isValidSkill
    ? await findNearbyWorkers({
        matchSkills: [skill],
        origin,
        radiusKm: DEFAULT_SEARCH_RADIUS_KM,
      })
    : { workers: [] };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link
        href={parentGroup ? `/skills/${parentGroup.slug}` : "/#skills"}
        className="text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        ← Back to {parentGroup ? parentGroup.name : "all categories"}
      </Link>

      <h1 className="mt-2 text-2xl font-bold text-gray-900">
        {skill} workers
        <span className="ml-2 text-base font-normal text-gray-500">
          {skill} वर्कर
        </span>
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        {workers.length} worker{workers.length === 1 ? "" : "s"}
        {origin ? ` within ${DEFAULT_SEARCH_RADIUS_KM} km` : ""}
      </p>

      {!isValidSkill ? (
        <p className="mt-8 text-sm text-gray-500">Unknown skill.</p>
      ) : workers.length === 0 ? (
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
          No workers found for {skill}
          {origin ? ` within ${DEFAULT_SEARCH_RADIUS_KM} km` : ""}. Try the full search page
          for a wider radius.
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workers.map((w) => (
            <div key={w.workerUserId} className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-3">
                {w.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={w.photoUrl}
                    alt={w.fullName}
                    className="h-12 w-12 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100 text-lg text-gray-400">
                    👤
                  </span>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{w.fullName}</h3>
                  <StarRating avg={w.rating} count={w.ratingCount} />
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {w.experienceYears} yrs experience &middot;{" "}
                {AVAILABILITY_LABELS[w.availability] ?? w.availability}
              </p>
              <p className="mt-1 text-sm font-medium text-gray-700">
                {w.distanceKm !== null ? `${w.distanceKm} km away` : `Pincode: ${w.pincode}`}
              </p>
              <p className="mt-1 text-sm text-blue-700">
                {formatFee(w.feePerDay, w.feePerHour)}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {w.skills.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <a
                href={`tel:+91${w.phone}`}
                className="mt-4 inline-block rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Call +91 {w.phone}
              </a>
              <BookNowButton
                workerUserId={w.workerUserId}
                skill={skill}
                destinationLat={origin?.lat}
                destinationLng={origin?.lng}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
