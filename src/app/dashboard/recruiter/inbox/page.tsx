import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getInboxThreads } from "@/lib/inbox";

export default async function RecruiterInboxPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "WORKER") redirect("/dashboard/worker");
  if (!user.recruiterProfile) redirect("/register/recruiter");

  const threads = await getInboxThreads(user.id, "RECRUITER");

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900">Inbox</h1>
      <p className="mt-1 text-sm text-gray-500">Chats with workers about your bookings.</p>

      {threads.length === 0 ? (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-8 text-center">
          <span className="text-3xl">💬</span>
          <p className="mt-2 text-sm font-semibold text-gray-700">No conversations yet</p>
          <p className="mt-0.5 text-xs text-gray-400">
            Chats appear here once you book a worker.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-2">
          {threads.map((t) => (
            <li key={t.bookingId}>
              <Link
                href={`/bookings/${t.bookingId}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 transition hover:border-blue-300"
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    {t.counterpartName} — {t.skill}
                    {t.unread && <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {t.lastMessage ? t.lastMessage.body : "No messages yet — say hello!"}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-gray-400">
                  {new Date(t.updatedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
