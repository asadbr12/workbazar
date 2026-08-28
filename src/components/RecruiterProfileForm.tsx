"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type RecruiterFormValues = {
  fullName: string;
  address: string;
  pincode: string;
  lat: string;
  lng: string;
};

const DEFAULT_VALUES: RecruiterFormValues = {
  fullName: "",
  address: "",
  pincode: "",
  lat: "",
  lng: "",
};

export default function RecruiterProfileForm({
  initial,
  heading,
  subheading,
  submitLabel,
  redirectTo,
}: {
  initial?: Partial<RecruiterFormValues>;
  heading: React.ReactNode;
  subheading: React.ReactNode;
  submitLabel: string;
  redirectTo: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<RecruiterFormValues>({ ...DEFAULT_VALUES, ...initial });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  function update<K extends keyof RecruiterFormValues>(key: K, value: RecruiterFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function useMyLocation() {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("Location is not supported on this device");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        update("lat", String(pos.coords.latitude));
        update("lng", String(pos.coords.longitude));
        setLocating(false);
      },
      () => {
        setLocationError("Couldn't get your location — please allow location access");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/register/recruiter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          officeAddress: form.address,
          pincode: form.pincode,
          lat: form.lat || undefined,
          lng: form.lng || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save profile");
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900">{heading}</h1>
      <p className="mt-1 text-sm text-gray-500">{subheading}</p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-4 rounded-xl border border-gray-200 bg-white p-6"
      >
        <Field label="Full name" hindi="पूरा नाम">
          <input
            required
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Address" hindi="पता">
          <textarea
            required
            rows={2}
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Pincode" hindi="पिन कोड">
          <input
            required
            maxLength={6}
            inputMode="numeric"
            value={form.pincode}
            onChange={(e) => update("pincode", e.target.value.replace(/\D/g, ""))}
            className="input"
          />
        </Field>

        <div>
          <button
            type="button"
            onClick={useMyLocation}
            disabled={locating}
            className="rounded-md border border-blue-300 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50"
          >
            {locating
              ? "Locating..."
              : form.lat
                ? "✓ Location captured — search will show nearest workers"
                : "📍 Use my current location"}
          </button>
          {locationError && (
            <p className="mt-1 text-xs text-red-600">{locationError}</p>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : submitLabel}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  hindi,
  children,
}: {
  label: string;
  hindi: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label">
        {label} <span className="text-gray-400">{hindi}</span>
      </label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
