import Link from "next/link";
import AuthForm from "@/components/AuthForm";

type Role = "WORKER" | "RECRUITER";

function isRole(value: unknown): value is Role {
  return value === "WORKER" || value === "RECRUITER";
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; next?: string }>;
}) {
  const params = await searchParams;
  const role = isRole(params.role) ? params.role : null;
  const next = params.next;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16">
      <h1 className="text-2xl font-bold text-gray-900">Sign up</h1>

      {!role ? (
        <>
          <p className="mt-1 text-sm text-gray-500">
            First, tell us who you are
          </p>
          <div className="mt-8 grid w-full gap-4">
            <Link
              href={{ pathname: "/signup", query: { role: "WORKER", ...(next ? { next } : {}) } }}
              className="rounded-lg border-2 border-blue-600 bg-white px-6 py-5 text-center font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50"
            >
              I&apos;m a Worker
            </Link>
            <Link
              href={{ pathname: "/signup", query: { role: "RECRUITER", ...(next ? { next } : {}) } }}
              className="rounded-lg bg-blue-600 px-6 py-5 text-center font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              I&apos;m a Recruiter
            </Link>
          </div>
        </>
      ) : (
        <>
          <p className="mt-1 text-sm text-gray-500">
            Signing up as a{" "}
            <span className="font-semibold">
              {role === "WORKER" ? "Worker" : "Recruiter"}
            </span>{" "}
            &middot;{" "}
            <Link href="/signup" className="text-blue-600 hover:underline">
              change
            </Link>
          </p>
          <div className="mt-8 w-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <AuthForm role={role} next={next} />
          </div>
        </>
      )}
    </div>
  );
}
