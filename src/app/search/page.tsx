import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import SearchClient from "@/components/SearchClient";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const user = await getCurrentUser();
  if (!user) redirect(`/signup?role=RECRUITER&next=${encodeURIComponent("/search")}`);
  if (!user.role) redirect(`/signup?next=${encodeURIComponent("/search")}`);
  if (user.role === "RECRUITER" && !user.recruiterProfile) {
    redirect(`/register/recruiter?next=${encodeURIComponent("/search")}`);
  }

  const profileLat = user.recruiterProfile?.lat ?? null;
  const profileLng = user.recruiterProfile?.lng ?? null;

  return (
    <SearchClient
      initialQuery={q ?? ""}
      profileLat={profileLat}
      profileLng={profileLng}
    />
  );
}
