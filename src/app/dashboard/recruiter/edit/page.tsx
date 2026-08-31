import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import RecruiterProfileForm from "@/components/RecruiterProfileForm";

export default async function EditRecruiterProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "WORKER") redirect("/dashboard/worker");
  if (!user.recruiterProfile) redirect("/register/recruiter");

  const profile = user.recruiterProfile;

  return (
    <RecruiterProfileForm
      heading="Edit your profile"
      subheading="Keep your details up to date."
      submitLabel="Save changes"
      redirectTo="/dashboard/recruiter"
      initial={{
        fullName: profile.fullName,
        address: profile.officeAddress,
        state: profile.state ?? "",
        district: profile.district ?? "",
        pincode: profile.pincode,
        lat: profile.lat?.toString() ?? "",
        lng: profile.lng?.toString() ?? "",
      }}
    />
  );
}
