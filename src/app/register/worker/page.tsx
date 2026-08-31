"use client";

import WorkerProfileForm from "@/components/WorkerProfileForm";

export default function WorkerRegistrationPage() {
  return (
    <WorkerProfileForm
      heading="Worker Registration वर्कर पंजीकरण"
      subheading="Recruiters near you will find you. आस-पास के रिक्रूटर आपको खोज सकेंगे।"
      submitLabel="Save & continue to payment"
      redirectTo="/payment"
    />
  );
}
