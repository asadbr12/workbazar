"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase-client";

type Role = "WORKER" | "RECRUITER";

function nextStepUrl(
  data: {
    role: Role | null;
    hasProfile: boolean;
    hasActiveSubscription: boolean;
  },
  next?: string | null
) {
  if (!data.role) return "/signup";
  if (!data.hasProfile) {
    const registerPath =
      data.role === "WORKER" ? "/register/worker" : "/register/recruiter";
    return next ? `${registerPath}?next=${encodeURIComponent(next)}` : registerPath;
  }
  // Recruiters are always free — only workers need an active subscription.
  if (data.role === "WORKER" && !data.hasActiveSubscription) return "/payment";
  if (next) return next;
  return data.role === "WORKER" ? "/dashboard/worker" : "/dashboard/recruiter";
}

function friendlyFirebaseError(code: string): string {
  switch (code) {
    case "auth/invalid-phone-number":
      return "Enter a valid 10-digit mobile number";
    case "auth/too-many-requests":
      return "Too many attempts — please try again later";
    case "auth/invalid-verification-code":
      return "Incorrect OTP";
    case "auth/code-expired":
      return "This OTP has expired, request a new one";
    default:
      return "Something went wrong, please try again";
  }
}

const OTP_TTL_SECONDS = 90;

export default function AuthForm({ role, next }: { role?: Role; next?: string }) {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(OTP_TTL_SECONDS);
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    return () => {
      recaptchaVerifierRef.current?.clear();
    };
  }, []);

  useEffect(() => {
    if (step !== "otp" || secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [step, secondsLeft]);

  const expired = step === "otp" && secondsLeft <= 0;

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!recaptchaVerifierRef.current && recaptchaContainerRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(
          firebaseAuth,
          recaptchaContainerRef.current,
          { size: "invisible" }
        );
      }
      const confirmation = await signInWithPhoneNumber(
        firebaseAuth,
        `+91${phone}`,
        recaptchaVerifierRef.current!
      );
      confirmationRef.current = confirmation;
      setStep("otp");
      setSecondsLeft(OTP_TTL_SECONDS);
    } catch (err) {
      const code = (err as { code?: string })?.code;
      setError(code ? friendlyFirebaseError(code) : "Failed to send OTP");
      recaptchaVerifierRef.current?.clear();
      recaptchaVerifierRef.current = null;
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!confirmationRef.current || expired) throw new Error("This OTP has expired, request a new one");
      const result = await confirmationRef.current.confirm(code);
      const idToken = await result.user.getIdToken();

      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Verification failed");
      router.push(nextStepUrl(data, next));
      router.refresh();
    } catch (err) {
      const code = (err as { code?: string })?.code;
      setError(code ? friendlyFirebaseError(code) : err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div ref={recaptchaContainerRef} />
      {step === "phone" ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mobile number
            </label>
            <div className="mt-1 flex items-center rounded-md border border-gray-300 bg-white px-3 focus-within:ring-2 focus-within:ring-blue-500">
              <span className="text-gray-500 text-sm">+91</span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="98765 43210"
                className="w-full border-0 bg-transparent px-2 py-2 text-sm outline-none"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading || phone.length !== 10}
            className="w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Enter the 6-digit OTP sent to +91 {phone}
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              required
              disabled={expired}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-center text-lg tracking-[0.5em] outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
            />
            <p className={`mt-1.5 text-xs ${expired ? "text-red-600" : "text-gray-500"}`}>
              {expired ? "OTP expired — request a new one" : `Code expires in ${secondsLeft}s`}
            </p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {expired ? (
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Resend OTP"}
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setStep("phone");
              setCode("");
              setError(null);
            }}
            className="w-full text-sm text-gray-500 hover:text-gray-700"
          >
            Change phone number
          </button>
        </form>
      )}
    </>
  );
}
