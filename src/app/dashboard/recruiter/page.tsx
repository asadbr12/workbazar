import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RECRUITER_STATUS_LABEL, STATUS_COLOR } from "@/lib/booking-labels";

const POPULAR_SKILLS = ["Plumber", "Electrician", "Carpenter", "Painter", "Cleaner"];

export default async function RecruiterDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "WORKER") redirect("/dashboard/worker");
  if (!user.recruiterProfile) redirect("/register/recruiter");

  const profile = user.recruiterProfile;

  const [recentBookings, pendingCount, activeCount, completedCount] = await Promise.all([
    prisma.booking.findMany({
      where: { recruiterId: user.id },
      include: { worker: { select: { phone: true, workerProfile: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.booking.count({ where: { recruiterId: user.id, status: "REQUESTED" } }),
    prisma.booking.count({
      where: { recruiterId: user.id, status: { in: ["ACCEPTED", "EN_ROUTE", "ARRIVED"] } },
    }),
    prisma.booking.count({ where: { recruiterId: user.id, status: "COMPLETED" } }),
  ]);

  const location = [profile.officeAddress, profile.pincode].filter(Boolean).join(" · ");

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="animate-fade-in-up relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-100 p-5">
        <div className="relative z-10 max-w-lg">
          <h1 className="text-xl font-bold text-gray-900">
            Welcome back, {profile.fullName.split(" ")[0]}! 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500">Find skilled professionals for your work</p>
          {location && (
            <p className="mt-2 flex items-center gap-1 text-xs text-gray-500">
              <span aria-hidden>📍</span> {location}
            </p>
          )}
        </div>
        <div className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 sm:block">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/70 text-2xl shadow-inner">
            🧑‍💼
          </div>
          <span className="absolute -left-2 -top-1 flex h-6 w-6 items-center justify-center rounded-lg bg-white text-xs shadow">
            🔎
          </span>
          <span className="absolute -right-2 bottom-0 flex h-6 w-6 items-center justify-center rounded-lg bg-white text-xs shadow">
            🏗️
          </span>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon="📋"
          iconBg="bg-amber-50 text-amber-600"
          label="Pending Requests"
          value={String(pendingCount)}
          hint="Waiting for worker"
          hintColor="text-amber-600"
          delay={80}
        />
        <StatCard
          icon="💼"
          iconBg="bg-blue-50 text-blue-600"
          label="Active Bookings"
          value={String(activeCount)}
          hint="In progress"
          hintColor="text-blue-600"
          delay={150}
        />
        <StatCard
          icon="✅"
          iconBg="bg-green-50 text-green-600"
          label="Completed Bookings"
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
            title="My Bookings"
            viewAllHref={recentBookings.length > 0 ? "/dashboard/recruiter/bookings" : undefined}
            delay={280}
          >
            {recentBookings.length === 0 ? (
              <EmptyState
                icon="📅"
                title="No bookings yet"
                text="Search a skill to find and book a worker."
              />
            ) : (
              <ul className="space-y-3">
                {recentBookings.map((b) => (
                  <li key={b.id} className="rounded-lg border border-gray-200 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {b.worker.workerProfile?.fullName ?? "Worker"} — {b.skill}
                        </p>
                        <p className="text-xs text-gray-500">+91 {b.worker.phone}</p>
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
          </Card>

          <Card title="Find Workers Near You" delay={340}>
            <p className="text-sm text-gray-500">
              Search by skill to see the nearest available workers with phone number, fee, and
              distance.
            </p>
            <form action="/search" method="get" className="mt-3 flex gap-2">
              <input
                name="q"
                placeholder="Search for a skill (e.g. Plumber, Electrician)"
                className="input"
              />
              <button
                type="submit"
                className="shrink-0 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Search
              </button>
            </form>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-gray-400">Popular:</span>
              {POPULAR_SKILLS.map((skill) => (
                <Link
                  key={skill}
                  href={`/workers/${encodeURIComponent(skill)}`}
                  className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                >
                  {skill}
                </Link>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card
            title="Your Profile"
            viewAllHref="/dashboard/recruiter/edit"
            viewAllLabel="Edit Profile"
            delay={400}
          >
            <dl className="space-y-2.5 text-sm">
              <SummaryRow icon="📍" label="Address" value={profile.officeAddress || "—"} />
              <SummaryRow icon="🏷️" label="Pincode" value={profile.pincode || "—"} />
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
              <QuickAction href="/search" color="bg-blue-600" label="Search Workers" />
              <QuickAction
                href="/dashboard/recruiter/bookings"
                color="bg-violet-600"
                label="View My Bookings"
              />
              <QuickAction
                href="/dashboard/recruiter/edit"
                color="bg-green-600"
                label="Edit Profile"
              />
            </div>
          </Card>
        </div>
      </div>

      <div
        className="animate-fade-in-up flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm text-blue-800"
        style={{ animationDelay: "520ms" }}
      >
        <span aria-hidden>🛡️</span> All workers on ALWorkBazar are verified — never share
        payment details outside the platform.
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
      <span className="max-w-[55%] truncate text-right font-medium text-gray-800">{value}</span>
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
