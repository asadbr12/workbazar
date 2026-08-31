import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, hasActiveSubscription } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWorkerRatingStats } from "@/lib/ratings";
import { AVAILABILITY_LABELS } from "@/lib/validation";
import { formatFee } from "@/lib/format";
import { STATUS_LABEL, STATUS_COLOR } from "@/lib/booking-labels";
import StarRating from "@/components/StarRating";

function profileStrength(profile: {
  photoUrl: string | null;
  skills: string[];
  experienceYears: number;
  feePerDay: number | null;
  feePerHour: number | null;
  town: string | null;
  upiId: string | null;
  accountNumber: string | null;
  lat: number | null;
}): number {
  const checks = [
    Boolean(profile.photoUrl),
    profile.skills.length > 0,
    profile.experienceYears > 0,
    profile.feePerDay !== null || profile.feePerHour !== null,
    Boolean(profile.town),
    Boolean(profile.upiId || profile.accountNumber),
    profile.lat !== null,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

export default async function WorkerDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "RECRUITER") redirect("/dashboard/recruiter");
  if (!user.workerProfile) redirect("/register/worker");
  if (!hasActiveSubscription(user.subscriptions)) redirect("/payment");

  const profile = user.workerProfile;
  const subscription = user.subscriptions[0];

  const [recentRequests, requestCount, activeCount, completedCount, ratingStats] =
    await Promise.all([
      prisma.booking.findMany({
        where: { workerId: user.id, status: "REQUESTED" },
        include: { recruiter: { select: { phone: true, recruiterProfile: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.booking.count({ where: { workerId: user.id, status: "REQUESTED" } }),
      prisma.booking.count({
        where: { workerId: user.id, status: { in: ["ACCEPTED", "EN_ROUTE", "ARRIVED"] } },
      }),
      prisma.booking.count({ where: { workerId: user.id, status: "COMPLETED" } }),
      getWorkerRatingStats([user.id]),
    ]);

  const myRating = ratingStats[user.id] ?? { avg: 0, count: 0 };
  const strength = profileStrength(profile);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="animate-fade-in-up flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {profile.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.photoUrl}
              alt={profile.fullName}
              className="h-16 w-16 shrink-0 rounded-full border-2 border-white object-cover shadow-sm"
            />
          ) : (
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gray-100 text-2xl text-gray-400">
              👤
            </span>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Welcome back, {profile.fullName.split(" ")[0]}! 👋
            </h1>
            <p className="text-sm text-gray-500">
              Ready to get more work and grow your business today?
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {profile.skills.slice(0, 2).map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                >
                  {s}
                </span>
              ))}
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                {profile.experienceYears} yrs experience
              </span>
              <StarRating avg={myRating.avg} count={myRating.count} />
            </div>
          </div>
        </div>

        <div className="w-full shrink-0 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 p-4 text-white sm:w-56">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Profile Strength</span>
            <span className="text-lg font-bold">{strength}%</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-white" style={{ width: `${strength}%` }} />
          </div>
          {strength < 100 && (
            <Link
              href="/dashboard/worker/edit"
              className="mt-3 inline-block rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              Improve Profile
            </Link>
          )}
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon="📋"
          iconBg="bg-amber-50 text-amber-600"
          label="Booking Requests"
          value={String(requestCount)}
          hint="Waiting for response"
          hintColor="text-amber-600"
          delay={80}
        />
        <StatCard
          icon="💼"
          iconBg="bg-blue-50 text-blue-600"
          label="Active Jobs"
          value={String(activeCount)}
          hint="In progress"
          hintColor="text-blue-600"
          delay={150}
        />
        <StatCard
          icon="✅"
          iconBg="bg-green-50 text-green-600"
          label="Completed Jobs"
          value={String(completedCount)}
          hint="Total completed"
          hintColor="text-gray-400"
          delay={220}
        />
      </div>

      {/* Main + sidebar */}
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Card
            title="Recent Booking Requests"
            viewAllHref={requestCount > 0 ? "/dashboard/worker/bookings" : undefined}
            delay={280}
          >
            {recentRequests.length === 0 ? (
              <EmptyState
                icon="📋"
                title="No booking requests yet"
                text="When someone needs your skill, you'll see it here."
              />
            ) : (
              <ul className="space-y-3">
                {recentRequests.map((b) => (
                  <li key={b.id} className="rounded-lg border border-gray-200 p-3">
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
                      Respond →
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Job Matches Near You" delay={340}>
            <EmptyState
              icon="📍"
              title="No job matches yet"
              text="We'll show you nearby jobs that match your skills once recruiters start posting in your area."
            />
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Profile Summary" viewAllHref="/dashboard/worker/edit" viewAllLabel="Edit Profile" delay={400}>
            <dl className="space-y-2.5 text-sm">
              <SummaryRow icon="🎂" label="Age" value={`${profile.age} Years`} />
              <SummaryRow icon="⚧" label="Gender" value={profile.gender} />
              <SummaryRow icon="📍" label="Pincode" value={profile.pincode} />
              <SummaryRow
                icon="🕒"
                label="Availability"
                value={AVAILABILITY_LABELS[profile.availability] ?? profile.availability}
              />
              <SummaryRow icon="🧭" label="Travel Distance" value={`${profile.travelDistanceKm} km`} />
              <SummaryRow icon="₹" label="Fee" value={formatFee(profile.feePerDay, profile.feePerHour)} />
              <SummaryRow icon="📞" label="Phone" value={`+91 ${user.phone}`} />
              <SummaryRow
                icon="📅"
                label="Member Since"
                value={new Date(user.createdAt).toLocaleDateString("en-IN", {
                  month: "short",
                  year: "numeric",
                })}
              />
            </dl>
          </Card>

          <Card title="Quick Actions" delay={460}>
            <div className="grid grid-cols-1 gap-2">
              <QuickAction href="/dashboard/worker/edit" color="bg-green-600" label="Update Availability" />
              <QuickAction href="/dashboard/worker/bookings" color="bg-blue-600" label="View Booking Requests" />
              <QuickAction href="/dashboard/worker/jobs" color="bg-violet-600" label="View My Jobs" />
            </div>
          </Card>

          <div
            className="animate-fade-in-up rounded-xl border border-green-200 bg-green-50 p-4"
            style={{ animationDelay: "520ms" }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Subscription Status</h3>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-xs text-white">
                ✓
              </span>
            </div>
            <p className="mt-1 text-sm font-semibold text-green-700">Active</p>
            {subscription?.endDate && (
              <p className="text-xs text-gray-500">
                Renews on {new Date(subscription.endDate).toLocaleDateString("en-IN")}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">You&apos;re all set! Keep up the great work.</p>
          </div>
        </div>
      </div>

      <div
        className="animate-fade-in-up flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm text-blue-800"
        style={{ animationDelay: "580ms" }}
      >
        <span aria-hidden>🛡️</span> Your safety is our priority. Never share personal
        information outside the platform.
      </div>
    </div>
  );
}

function StatCard({
  icon,
  iconBg,
  label,
  value,
  hint,
  hintColor,
  delay = 0,
}: {
  icon: string;
  iconBg: string;
  label: string;
  value: string;
  hint: string;
  hintColor: string;
  delay?: number;
}) {
  return (
    <div
      className="card-hover animate-fade-in-up flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-lg ${iconBg}`}>
        {icon}
      </span>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className={`text-xs ${hintColor}`}>{hint}</p>
      </div>
    </div>
  );
}

function Card({
  title,
  children,
  delay = 0,
  viewAllHref,
  viewAllLabel = "View All",
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
  viewAllHref?: string;
  viewAllLabel?: string;
}) {
  return (
    <div
      className="card-hover animate-fade-in-up rounded-xl border border-gray-200 bg-white p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">{title}</h2>
        {viewAllHref && (
          <Link href={viewAllHref} className="text-xs font-semibold text-blue-600 hover:text-blue-700">
            {viewAllLabel} →
          </Link>
        )}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function EmptyState({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="py-6 text-center">
      <span className="text-3xl">{icon}</span>
      <p className="mt-2 text-sm font-semibold text-gray-700">{title}</p>
      <p className="mt-0.5 text-xs text-gray-400">{text}</p>
    </div>
  );
}

function SummaryRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-2 text-gray-500">
        <span aria-hidden>{icon}</span> {label}
      </span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  );
}

function QuickAction({ href, color, label }: { href: string; color: string; label: string }) {
  return (
    <Link
      href={href}
      className={`rounded-lg px-3 py-2.5 text-center text-sm font-semibold text-white transition hover:opacity-90 ${color}`}
    >
      {label}
    </Link>
  );
}
