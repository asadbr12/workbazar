import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, hasActiveSubscription } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWorkerRatingStats } from "@/lib/ratings";
import { AVAILABILITY_LABELS } from "@/lib/validation";
import { formatFee } from "@/lib/format";
import StarRating from "@/components/StarRating";

const STATUS_LABEL: Record<string, string> = {
  REQUESTED: "New request",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  EN_ROUTE: "On the way",
  ARRIVED: "Arrived",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const STATUS_COLOR: Record<string, string> = {
  REQUESTED: "bg-amber-100 text-amber-700",
  ACCEPTED: "bg-blue-100 text-blue-700",
  EN_ROUTE: "bg-blue-100 text-blue-700",
  ARRIVED: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-green-100 text-green-700",
  DECLINED: "bg-gray-100 text-gray-500",
  CANCELLED: "bg-gray-100 text-gray-500",
};

export default async function WorkerDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "RECRUITER") redirect("/dashboard/recruiter");
  if (!user.workerProfile) redirect("/register/worker");
  if (!hasActiveSubscription(user.subscriptions)) redirect("/payment");

  const profile = user.workerProfile;
  const subscription = user.subscriptions[0];

  const bookings = await prisma.booking.findMany({
    where: { workerId: user.id },
    include: { recruiter: { select: { phone: true, recruiterProfile: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const ratingStats = await getWorkerRatingStats([user.id]);
  const myRating = ratingStats[user.id] ?? { avg: 0, count: 0 };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="animate-fade-in-up flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
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
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {profile.fullName.split(" ")[0]}
            </h1>
            <p className="text-sm text-gray-500">
              {profile.skills.join(", ")} &middot; {profile.experienceYears} yrs
              experience
            </p>
            <div className="mt-1">
              <StarRating avg={myRating.avg} count={myRating.count} size="md" />
            </div>
          </div>
        </div>
        <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
          Subscription active
          {subscription?.endDate &&
            ` · renews ${new Date(subscription.endDate).toLocaleDateString("en-IN")}`}
        </span>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        <StatCard
          label="Rating"
          value={myRating.count ? myRating.avg.toFixed(1) : "—"}
          hint={`From ${myRating.count} completed job${myRating.count === 1 ? "" : "s"}`}
          delay={80}
        />
        <StatCard
          label="Booking requests"
          value={String(bookings.filter((b) => b.status === "REQUESTED").length)}
          hint="Waiting for your response"
          delay={150}
        />
        <StatCard label="Messages" value="0" hint="Unread messages" delay={220} />
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <Card title="Booking requests & jobs" delay={280}>
          {bookings.length === 0 ? (
            <EmptyState text="No booking requests yet. Recruiters who search your skill can book you directly." />
          ) : (
            <ul className="space-y-3">
              {bookings.map((b) => (
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
                    {b.status === "REQUESTED" ? "Respond →" : "View / track →"}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Job matches near you" delay={340}>
          <EmptyState text="No job matches yet. This shows nearby jobs matching your skills once recruiters start posting in your area." />
        </Card>
        <Card title="Upcoming work schedule" delay={400}>
          <EmptyState text="No upcoming work scheduled." />
        </Card>
        <Card title="Inbox" delay={460}>
          <EmptyState text="No messages yet." />
        </Card>
      </div>

      <div className="mt-8">
        <Card title="Your profile" delay={520}>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
            <Item label="Age" value={String(profile.age)} />
            <Item label="Gender" value={profile.gender} />
            <Item label="Pincode" value={profile.pincode} />
            <Item
              label="Availability"
              value={AVAILABILITY_LABELS[profile.availability] ?? profile.availability}
            />
            <Item label="Travel distance" value={`${profile.travelDistanceKm} km`} />
            <Item label="Fee" value={formatFee(profile.feePerDay, profile.feePerHour)} />
            <Item label="Location" value={profile.lat ? "Captured ✓" : "Not set"} />
            <Item label="Account phone" value={`+91 ${user.phone}`} />
            <Item
              label="Member since"
              value={new Date(user.createdAt).toLocaleDateString("en-IN", {
                month: "short",
                year: "numeric",
              })}
            />
          </dl>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  delay = 0,
}: {
  label: string;
  value: string;
  hint: string;
  delay?: number;
}) {
  return (
    <div
      className="card-hover animate-fade-in-up rounded-xl border border-gray-200 bg-white p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-400">{hint}</p>
    </div>
  );
}

function Card({
  title,
  children,
  delay = 0,
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <div
      className="card-hover animate-fade-in-up rounded-xl border border-gray-200 bg-white p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <h2 className="font-semibold text-gray-900">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="text-sm text-gray-400">{text}</p>;
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-gray-400">{label}</dt>
      <dd className="font-medium text-gray-800">{value}</dd>
    </div>
  );
}
