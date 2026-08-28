import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import WorkerProfileForm from "@/components/WorkerProfileForm";

export default async function EditWorkerProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "RECRUITER") redirect("/dashboard/recruiter");
  if (!user.workerProfile) redirect("/register/worker");

  const profile = user.workerProfile;

  return (
    <WorkerProfileForm
      heading="Edit your profile"
      subheading="Keep your details up to date so recruiters can reach you accurately."
      submitLabel="Save changes"
      redirectTo="/dashboard/worker"
      initial={{
        fullName: profile.fullName,
        age: String(profile.age),
        gender: profile.gender,
        address: profile.address,
        pincode: profile.pincode,
        aadharNumber: profile.aadharNumber ?? "",
        skills: profile.skills,
        experienceYears: String(profile.experienceYears),
        feePerDay: profile.feePerDay?.toString() ?? "",
        feePerHour: profile.feePerHour?.toString() ?? "",
        availability: profile.availability,
        travelDistanceKm: String(profile.travelDistanceKm),
        upiId: profile.upiId ?? "",
        accountNumber: profile.accountNumber ?? "",
        lat: profile.lat?.toString() ?? "",
        lng: profile.lng?.toString() ?? "",
        photoUrl: profile.photoUrl ?? "",
      }}
    />
  );
}
