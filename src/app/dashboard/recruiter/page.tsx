import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STATUS_LABEL: Record<string, string> = {
  REQUESTED: "Waiting for worker",
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

export default async function RecruiterDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "WORKER") redirect("/dashboard/worker");
  if (!user.recruiterProfile) redirect("/register/recruiter");

  const profile = user.recruiterProfile;

  const bookings = await prisma.booking.findMany({
    where: { recruiterId: user.id },
    include: { worker: { select: { phone: true, workerProfile: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="animate-fade-in-up flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {profile.fullName.split(" ")[0]}
          </h1>
          <p className="text-sm text-gray-500">
            {profile.companyName || "Individual recruiter"} &middot;{" "}
            {profile.officeAddress}
            {profile.pincode ? ` · ${profile.pincode}` : ""}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        <StatCard label="Active job posts" value="0" hint="Currently open requirements" delay={80} />
        <StatCard label="Applications received" value="0" hint="Across all job posts" delay={150} />
        <StatCard label="Shortlisted" value="0" hint="Workers shortlisted" delay={220} />
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <Card title="My bookings" delay={280}>
          {bookings.length === 0 ? (
            <EmptyState text="No bookings yet. Search a skill to find and book a worker." />
          ) : (
            <ul className="space-y-3">
              {bookings.map((b) => (
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
                      {STATUS_LABEL[b.status] ?? b.status}
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
        <Card title="Find workers near you" delay={340}>
          <p className="text-sm text-gray-500">
            Search by skill to see the nearest available workers with phone
            number, fee, and distance.
          </p>
          <Link
            href="/search"
            className="mt-3 inline-block text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Search workers ↗
          </Link>
          <Link
            href="/#skills"
            className="mt-1 block text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Browse by category ↗
          </Link>
        </Card>
        <Card title="Candidate management" delay={400}>
          <EmptyState text="No candidates in your pipeline yet." />
        </Card>
        <Card title="Inbox" delay={460}>
          <EmptyState text="No messages yet." />
        </Card>
      </div>

      <div className="mt-8">
        <Card title="Your profile" delay={520}>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
            <Item label="Business type" value={profile.businessType || "—"} />
            <Item label="GST number" value={profile.gstNumber || "—"} />
            <Item label="Payment terms" value={profile.paymentTerms || "—"} />
            <Item label="Budget range" value={profile.budgetRange || "—"} />
            <Item label="Worker types needed" value={profile.workerTypesNeeded.join(", ") || "—"} />
            <Item label="Pincode" value={profile.pincode || "—"} />
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
