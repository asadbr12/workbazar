"use client";

import WorkerProfileForm from "@/components/WorkerProfileForm";

export default function WorkerRegistrationPage() {
  return (
    <WorkerProfileForm
      heading="Worker registration"
      subheading="Tell us about yourself so recruiters near you can find you."
      submitLabel="Save & continue to payment"
      redirectTo="/payment"
    />
  );
}
