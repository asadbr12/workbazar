import AuthForm from "@/components/AuthForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16">
      <h1 className="text-2xl font-bold text-gray-900">Log in</h1>
      <p className="mt-1 text-sm text-gray-500">
        Log in with your registered mobile number
      </p>

      <div className="mt-8 w-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <AuthForm next={next} />
      </div>
    </div>
  );
}
