"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

export default function AuthForm({ role, next }: { role?: Role; next?: string }) {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send OTP");
      setDemoCode(data.demoCode ?? null);
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Verification failed");
      router.push(nextStepUrl(data, next));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (step === "phone") {
    return (
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
    );
  }

  return (
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
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="123456"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-center text-lg tracking-[0.5em] outline-none focus:ring-2 focus:ring-blue-500"
        />
        {demoCode && (
          <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Demo mode (no SMS provider configured): your OTP is{" "}
            <span className="font-mono font-bold">{demoCode}</span>
          </p>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading || code.length !== 6}
        className="w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Verifying..." : "Verify & Continue"}
      </button>

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
  );
}
