"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import RecruiterProfileForm from "@/components/RecruiterProfileForm";

export default function RecruiterRegistrationPage() {
  return (
    <Suspense>
      <RecruiterRegistrationInner />
    </Suspense>
  );
}

function RecruiterRegistrationInner() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  return (
    <RecruiterProfileForm
      heading={
        <>
          Recruiter sign up
          <span className="ml-2 text-base font-normal text-gray-500">
            रिक्रूटर साइन अप
          </span>
        </>
      }
      subheading={
        <>
          Just your name and address to start browsing workers.
        </>
      }
      submitLabel="Start browsing workers"
      redirectTo={next || "/dashboard/recruiter"}
    />
  );
}
