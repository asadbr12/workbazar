"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

type PaymentMethod = "UPI" | "CARD" | "QR";

const METHODS: { id: PaymentMethod; label: string; hint: string }[] = [
  { id: "UPI", label: "UPI", hint: "Google Pay, PhonePe, Paytm & more" },
  { id: "CARD", label: "Card", hint: "Visa, Mastercard, RuPay" },
  { id: "QR", label: "QR Code", hint: "Scan & pay from any UPI app" },
];

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

export default function PaymentPage() {
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethod>("UPI");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<"WORKER" | "RECRUITER" | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        setRole(data.user?.role ?? null);
        if (data.user?.role === "RECRUITER") {
          router.replace("/dashboard/recruiter");
        }
      });
  }, [router]);

  function goToDashboard() {
    router.push(role === "RECRUITER" ? "/dashboard/recruiter" : "/dashboard/worker");
    router.refresh();
  }

  async function handleSubscribe() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/payment/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: method }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Payment failed to start");

      if (data.demoMode) {
        goToDashboard();
        return;
      }

      const razorpay = new window.Razorpay({
        key: data.razorpayKeyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.razorpayOrderId,
        name: "Work Bazar",
        description: "Monthly subscription",
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          if (verifyRes.ok) {
            goToDashboard();
          } else {
            setError("Payment verification failed, please try again");
          }
        },
        theme: { color: "#2563EB" },
      });
      razorpay.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <h1 className="text-2xl font-bold text-gray-900">Subscribe to Work Bazar</h1>
      <p className="mt-1 text-sm text-gray-500">
        Unlock full access for just ₹99/month.
      </p>

      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-gray-500">Monthly plan</span>
          <span className="text-3xl font-bold text-gray-900">
            ₹99<span className="text-base font-normal text-gray-500">/mo</span>
          </span>
        </div>

        <div className="mt-6 space-y-2">
          <span className="label">Choose payment method</span>
          {METHODS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethod(m.id)}
              className={`flex w-full items-center justify-between rounded-md border px-4 py-3 text-left transition ${
                method === m.id
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span>
                <span className="block text-sm font-semibold text-gray-900">
                  {m.label}
                </span>
                <span className="block text-xs text-gray-500">{m.hint}</span>
              </span>
              <span
                className={`h-4 w-4 rounded-full border-2 ${
                  method === m.id ? "border-blue-600 bg-blue-600" : "border-gray-300"
                }`}
              />
            </button>
          ))}
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="mt-6 w-full rounded-md bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Processing..." : "Pay ₹99 & Activate"}
        </button>
      </div>
    </div>
  );
}
