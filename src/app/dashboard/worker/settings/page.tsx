import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, hasActiveSubscription } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export default async function WorkerAccountSettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "RECRUITER") redirect("/dashboard/recruiter");
  if (!user.workerProfile) redirect("/register/worker");

  const profile = user.workerProfile;
  const subscription = user.subscriptions[0];
  const active = hasActiveSubscription(user.subscriptions);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="animate-fade-in-up flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Account settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            खाता सेटिंग्स &middot; Manage your account, membership and login.
          </p>
        </div>
        <Link
          href="/dashboard/worker"
          className="text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
        >
          ← Back to dashboard
        </Link>
      </div>

      <section
        className="card-hover animate-fade-in-up mt-8 rounded-xl border border-gray-200 bg-white p-6"
        style={{ animationDelay: "80ms" }}
      >
        <h2 className="font-semibold text-gray-900">Account</h2>
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Item label="Name" value={profile.fullName} />
          <Item label="Phone number" value={`+91 ${user.phone}`} />
          <Item
            label="Member since"
            value={new Date(user.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          />
        </dl>
        <p className="mt-3 text-xs text-gray-400">
          Your phone number is your login ID and can&apos;t be changed here — contact
          support if you&apos;ve lost access to it.
        </p>
      </section>

      <section
        className="card-hover animate-fade-in-up mt-6 rounded-xl border border-gray-200 bg-white p-6"
        style={{ animationDelay: "160ms" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Membership</h2>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {active ? "Active" : "Inactive"}
          </span>
        </div>
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Item label="Plan" value={`₹${subscription?.amount ?? 99}/month`} />
          <Item
            label={active ? "Renews on" : "Status"}
            value={
              subscription?.endDate
                ? new Date(subscription.endDate).toLocaleDateString("en-IN")
                : "No active plan"
            }
          />
          <Item label="Payment method" value={subscription?.paymentMethod ?? "—"} />
        </dl>
        <Link
          href="/payment"
          className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 hover:shadow-md"
        >
          {active ? "Manage / renew plan" : "Activate plan"}
        </Link>
      </section>

      <section
        className="card-hover animate-fade-in-up mt-6 rounded-xl border border-gray-200 bg-white p-6"
        style={{ animationDelay: "240ms" }}
      >
        <h2 className="font-semibold text-gray-900">Profile</h2>
        <p className="mt-1 text-sm text-gray-500">
          Update your photo, skills, fees, availability and address.
        </p>
        <Link
          href="/dashboard/worker/edit"
          className="mt-3 inline-block text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
        >
          Edit profile →
        </Link>
      </section>

      <section
        className="card-hover animate-fade-in-up mt-6 rounded-xl border border-red-200 bg-red-50/50 p-6"
        style={{ animationDelay: "320ms" }}
      >
        <h2 className="font-semibold text-gray-900">Log out</h2>
        <p className="mt-1 text-sm text-gray-500">
          Sign out of ALWorkBazar on this device.
        </p>
        <div className="mt-3">
          <LogoutButton />
        </div>
      </section>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-gray-400">{label}</dt>
      <dd className="font-medium text-gray-800">{value}</dd>
    </div>
  );
}
