"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SKILL_GROUPS } from "@/lib/validation";
import PhotoUpload from "@/components/PhotoUpload";

export type WorkerFormValues = {
  fullName: string;
  age: string;
  gender: string;
  address: string;
  pincode: string;
  aadharNumber: string;
  skills: string[];
  experienceYears: string;
  feePerDay: string;
  feePerHour: string;
  availability: string;
  travelDistanceKm: string;
  upiId: string;
  accountNumber: string;
  lat: string;
  lng: string;
  photoUrl: string;
};

const DEFAULT_VALUES: WorkerFormValues = {
  fullName: "",
  age: "",
  gender: "MALE",
  address: "",
  pincode: "",
  aadharNumber: "",
  skills: [],
  experienceYears: "",
  feePerDay: "",
  feePerHour: "",
  availability: "DAY",
  travelDistanceKm: "10",
  upiId: "",
  accountNumber: "",
  lat: "",
  lng: "",
  photoUrl: "",
};

export default function WorkerProfileForm({
  initial,
  heading,
  subheading,
  submitLabel,
  redirectTo,
}: {
  initial?: Partial<WorkerFormValues>;
  heading: string;
  subheading: string;
  submitLabel: string;
  redirectTo: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<WorkerFormValues>({ ...DEFAULT_VALUES, ...initial });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showCustomSkill, setShowCustomSkill] = useState(false);
  const [customSkill, setCustomSkill] = useState("");

  function update<K extends keyof WorkerFormValues>(key: K, value: WorkerFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addSkill(skill: string) {
    setForm((prev) =>
      prev.skills.includes(skill) ? prev : { ...prev, skills: [...prev.skills, skill] }
    );
  }

  function removeSkill(skill: string) {
    setForm((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
  }

  function handleSkillSelect(value: string) {
    if (!value) return;
    if (value === "__OTHER__") {
      setShowCustomSkill(true);
      return;
    }
    addSkill(value);
  }

  function addCustomSkill() {
    const value = customSkill.trim();
    if (!value) return;
    addSkill(value);
    setCustomSkill("");
    setShowCustomSkill(false);
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
    if (!form.photoUrl) {
      setError("Please upload your photo before saving");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/register/worker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
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
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">{heading}</h1>
      <p className="mt-1 text-sm text-gray-500">{subheading}</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="font-semibold text-gray-900">Personal details</h2>

          <PhotoUpload
            value={form.photoUrl}
            onChange={(url) => update("photoUrl", url)}
            required
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Full name">
              <input
                required
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Age">
              <input
                type="number"
                min={18}
                max={100}
                required
                value={form.age}
                onChange={(e) => update("age", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Gender">
              <select
                value={form.gender}
                onChange={(e) => update("gender", e.target.value)}
                className="input"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <Field label="Address">
                <textarea
                  required
                  rows={2}
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  className="input"
                />
              </Field>
            </div>
            <Field label="Pincode">
              <input
                required
                maxLength={6}
                value={form.pincode}
                onChange={(e) =>
                  update("pincode", e.target.value.replace(/\D/g, ""))
                }
                className="input"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Aadhar number (optional)">
              <input
                maxLength={12}
                value={form.aadharNumber}
                onChange={(e) =>
                  update("aadharNumber", e.target.value.replace(/\D/g, ""))
                }
                className="input"
              />
            </Field>
            <div className="sm:col-span-2 flex flex-col justify-end">
              <button
                type="button"
                onClick={useMyLocation}
                disabled={locating}
                className="rounded-md border border-blue-300 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50"
              >
                {locating
                  ? "Locating..."
                  : form.lat
                    ? "✓ Location captured — nearest search will find you"
                    : "📍 Use my current location"}
              </button>
              {locationError && (
                <p className="mt-1 text-xs text-red-600">{locationError}</p>
              )}
              <p className="mt-1 text-xs text-gray-400">
                Lets recruiters see how far you are when they search nearby.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="font-semibold text-gray-900">Professional details</h2>

          <div>
            <label className="label">Skills</label>
            <p className="mt-0.5 text-xs text-gray-400">
              Select a skill to add it below — स्किल चुनें, नीचे जुड़ जाएगी
            </p>

            <select
              value=""
              onChange={(e) => handleSkillSelect(e.target.value)}
              className="input mt-2 sm:max-w-md"
            >
              <option value="" disabled>
                Select a skill…
              </option>
              {SKILL_GROUPS.map((group) => (
                <optgroup key={group.slug} label={group.name}>
                  {group.skills
                    .filter((skill) => !form.skills.includes(skill))
                    .map((skill) => (
                      <option key={skill} value={skill}>
                        {skill}
                      </option>
                    ))}
                </optgroup>
              ))}
              <option value="__OTHER__">Other — अन्य (type your own)</option>
            </select>

            {showCustomSkill && (
              <div className="mt-2 flex gap-2 sm:max-w-md">
                <input
                  autoFocus
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomSkill();
                    }
                  }}
                  placeholder="Type your skill — अपना काम लिखें"
                  className="input"
                />
                <button
                  type="button"
                  onClick={addCustomSkill}
                  className="shrink-0 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            )}

            {form.skills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {form.skills.map((skill) => (
                  <span
                    key={skill}
                    className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-blue-400 hover:text-red-600"
                      aria-label={`Remove ${skill}`}
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Years of experience">
              <input
                type="number"
                min={0}
                max={60}
                required
                value={form.experienceYears}
                onChange={(e) => update("experienceYears", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Fee (₹/day)">
              <input
                type="number"
                min={0}
                placeholder="e.g. 600"
                value={form.feePerDay}
                onChange={(e) => update("feePerDay", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Fee (₹/hour)">
              <input
                type="number"
                min={0}
                placeholder="e.g. 80"
                value={form.feePerHour}
                onChange={(e) => update("feePerHour", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Availability">
              <select
                value={form.availability}
                onChange={(e) => update("availability", e.target.value)}
                className="input"
              >
                <option value="DAY">Day</option>
                <option value="NIGHT">Night</option>
                <option value="BOTH">Both Day &amp; Night</option>
              </select>
            </Field>
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="font-semibold text-gray-900">Travel &amp; payment</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Willing to travel (km)">
              <input
                type="number"
                min={0}
                max={500}
                required
                value={form.travelDistanceKm}
                onChange={(e) => update("travelDistanceKm", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="UPI ID (optional)">
              <input
                placeholder="name@bank"
                value={form.upiId}
                onChange={(e) => update("upiId", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Account number (optional)">
              <input
                value={form.accountNumber}
                onChange={(e) => update("accountNumber", e.target.value)}
                className="input"
              />
            </Field>
          </div>
        </section>

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
