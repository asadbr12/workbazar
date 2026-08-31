"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SKILL_GROUPS } from "@/lib/validation";
import { INDIA_STATES_AND_DISTRICTS } from "@/lib/india-locations";
import PhotoUpload from "@/components/PhotoUpload";

export type WorkerFormValues = {
  fullName: string;
  age: string;
  gender: string;
  address: string;
  state: string;
  district: string;
  town: string;
  pincode: string;
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
  state: "",
  district: "",
  town: "",
  pincode: "",
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

type FeeType = "PER_DAY" | "PER_HOUR";

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
  const [feeType, setFeeType] = useState<FeeType>(
    initial?.feePerHour && !initial?.feePerDay ? "PER_HOUR" : "PER_DAY"
  );
  const [feeAmount, setFeeAmount] = useState(
    initial?.feePerHour && !initial?.feePerDay ? initial.feePerHour : initial?.feePerDay ?? ""
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showCustomSkill, setShowCustomSkill] = useState(false);
  const [customSkill, setCustomSkill] = useState("");

  const districtOptions = useMemo(
    () => INDIA_STATES_AND_DISTRICTS.find((s) => s.state === form.state)?.districts ?? [],
    [form.state]
  );

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
          feePerDay: feeType === "PER_DAY" ? feeAmount || undefined : undefined,
          feePerHour: feeType === "PER_HOUR" ? feeAmount || undefined : undefined,
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
    <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-100 px-4 py-3 sm:px-5 sm:py-3.5">
        <div className="relative z-10 max-w-xl">
          <h1 className="text-lg font-extrabold text-gray-900 sm:text-xl">{heading}</h1>
          <p className="mt-0.5 text-xs text-gray-500">{subheading}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <Badge color="blue" icon="🛡️">
              Verified Clients <span className="font-normal opacity-70">सत्यापित ग्राहक</span>
            </Badge>
            <Badge color="purple" icon="📅">
              Daily Work Opportunities <span className="font-normal opacity-70">रोज़ काम के मौके</span>
            </Badge>
          </div>
        </div>
        <div className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 sm:block">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/70 text-xl shadow-inner">
            👷
          </div>
          <span className="absolute -left-2 -top-1 flex h-5 w-5 items-center justify-center rounded-lg bg-white text-[10px] shadow">
            🔧
          </span>
          <span className="absolute -right-2 bottom-0 flex h-5 w-5 items-center justify-center rounded-lg bg-white text-[10px] shadow">
            🪛
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-3 space-y-3">
        <section className="rounded-xl border border-gray-200 bg-white p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <SectionHeading color="violet" icon="👤" en="Personal Details" hi="व्यक्तिगत जानकारी" />
            <PhotoUpload
              hideLabel
              value={form.photoUrl}
              onChange={(url) => update("photoUrl", url)}
              required
            />
          </div>

          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <IconField en="Full Name" hi="पूरा नाम" icon="👤">
              <input
                required
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                placeholder="Enter your full name"
                className="input pl-9"
              />
            </IconField>
            <Field en="Age" hi="उम्र">
              <input
                type="number"
                min={18}
                max={100}
                required
                value={form.age}
                onChange={(e) => update("age", e.target.value)}
                placeholder="Enter your age"
                className="input"
              />
              <p className="mt-0.5 text-xs text-gray-400">
                18+ — उम्र 18 या ज़्यादा होनी चाहिए
              </p>
            </Field>
            <Field en="Gender" hi="लिंग">
              <select
                value={form.gender}
                onChange={(e) => update("gender", e.target.value)}
                className="input"
              >
                <option value="MALE">Male / पुरुष</option>
                <option value="FEMALE">Female / महिला</option>
                <option value="OTHER">Other / अन्य</option>
              </select>
            </Field>
          </div>

          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <IconField en="Address" hi="पता" icon="📍">
                <textarea
                  required
                  rows={2}
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  placeholder="Enter your complete address"
                  className="input pl-9"
                />
              </IconField>
            </div>
            <IconField en="Pincode" hi="पिनकोड" icon="📮">
              <input
                required
                maxLength={6}
                value={form.pincode}
                onChange={(e) => update("pincode", e.target.value.replace(/\D/g, ""))}
                placeholder="Enter pincode"
                className="input pl-9"
              />
            </IconField>
          </div>

          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Field en="State" hi="राज्य">
              <select
                required
                value={form.state}
                onChange={(e) => {
                  update("state", e.target.value);
                  update("district", "");
                }}
                className="input"
              >
                <option value="" disabled>
                  Select state…
                </option>
                {INDIA_STATES_AND_DISTRICTS.map((s) => (
                  <option key={s.state} value={s.state}>
                    {s.state}
                  </option>
                ))}
              </select>
            </Field>
            <Field en="District" hi="ज़िला">
              <select
                required
                disabled={!form.state}
                value={form.district}
                onChange={(e) => update("district", e.target.value)}
                className="input disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="" disabled>
                  {form.state ? "Select district…" : "Select state first"}
                </option>
                {districtOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </Field>
            <Field en="Town / Area (optional)" hi="कस्बा / इलाका">
              <input
                placeholder="e.g. Rajgir"
                value={form.town}
                onChange={(e) => update("town", e.target.value)}
                className="input"
              />
            </Field>
          </div>
          <p className="mt-0.5 text-xs text-gray-400">
            Pincode + District used to match you with nearby recruiters — पास के रिक्रूटर से मिलान
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={useMyLocation}
              disabled={locating}
              className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 transition hover:bg-violet-100 disabled:opacity-50"
            >
              {locating
                ? "Locating..."
                : form.lat
                  ? "✓ Location captured"
                  : "📍 Use my current location"}
            </button>
            <span className="text-xs text-gray-400">
              Let recruiters see how far you are when they search nearby.
            </span>
          </div>
          {locationError && <p className="mt-0.5 text-xs text-red-600">{locationError}</p>}
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-3">
          <SectionHeading
            color="green"
            icon="🛠️"
            en="Professional Details"
            hi="काम की जानकारी"
          />

          <div className="mt-2">
            <label className="label">
              Skills <span className="font-normal text-gray-400">कौन सा काम करना जानते हो</span>
            </label>

            <select
              value=""
              onChange={(e) => handleSkillSelect(e.target.value)}
              className="input mt-1"
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
              <div className="mt-2 flex gap-2">
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
                    className="flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-green-400 hover:text-red-600"
                      aria-label={`Remove ${skill}`}
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Field en="Experience (yrs)" hi="अनुभव (वर्ष)">
              <input
                type="number"
                min={0}
                max={60}
                required
                value={form.experienceYears}
                onChange={(e) => update("experienceYears", e.target.value)}
                placeholder="e.g. 3"
                className="input"
              />
            </Field>
            <Field en="Charge Type" hi="भाड़ा किस हिसाब से">
              <select
                value={feeType}
                onChange={(e) => setFeeType(e.target.value as FeeType)}
                className="input"
              >
                <option value="PER_DAY">Per Day / प्रति दिन</option>
                <option value="PER_HOUR">Per Hour / प्रति घंटा</option>
              </select>
            </Field>
            <Field
              en={feeType === "PER_DAY" ? "Fee per Day (₹)" : "Fee per Hour (₹)"}
              hi="फीस (₹)"
            >
              <input
                type="number"
                min={0}
                placeholder={feeType === "PER_DAY" ? "e.g. 600" : "e.g. 80"}
                value={feeAmount}
                onChange={(e) => setFeeAmount(e.target.value)}
                className="input"
              />
            </Field>
            <Field en="Availability" hi="कब काम कर सकते हो">
              <select
                value={form.availability}
                onChange={(e) => update("availability", e.target.value)}
                className="input"
              >
                <option value="DAY">Day / दिन</option>
                <option value="NIGHT">Night / रात</option>
                <option value="BOTH">Both Day &amp; Night / दिन और रात दोनों</option>
              </select>
            </Field>
          </div>
        </section>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2.5 font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
        >
          🔒 {loading ? "Saving..." : submitLabel} <span aria-hidden>→</span>
        </button>
        <p className="text-center text-xs text-gray-400">
          🛡️ Your information is safe and secure with us — आपकी जानकारी सुरक्षित है
        </p>
      </form>
    </div>
  );
}

const BADGE_STYLES: Record<string, string> = {
  green: "bg-green-50 text-green-700",
  blue: "bg-blue-50 text-blue-700",
  purple: "bg-purple-50 text-purple-700",
};

function Badge({
  color,
  icon,
  children,
}: {
  color: keyof typeof BADGE_STYLES;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${BADGE_STYLES[color]}`}
    >
      {icon} {children}
    </span>
  );
}

const ICON_BG_STYLES: Record<string, string> = {
  violet: "bg-gradient-to-br from-violet-600 to-purple-600",
  green: "bg-gradient-to-br from-emerald-500 to-green-600",
};

function SectionHeading({
  color,
  icon,
  en,
  hi,
}: {
  color: keyof typeof ICON_BG_STYLES;
  icon: string;
  en: string;
  hi: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm text-white ${ICON_BG_STYLES[color]}`}
      >
        {icon}
      </span>
      <h2 className="text-sm font-bold text-gray-900 sm:text-base">
        {en} <span className="font-normal text-gray-400">{hi}</span>
      </h2>
    </div>
  );
}

function Field({ en, hi, children }: { en: string; hi: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">
        {en} <span className="font-normal text-gray-400">{hi}</span>
      </label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function IconField({
  en,
  hi,
  icon,
  children,
}: {
  en: string;
  hi: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label">
        {en} <span className="font-normal text-gray-400">{hi}</span>
      </label>
      <div className="relative mt-1">
        <span className="pointer-events-none absolute left-3 top-3 text-gray-400">{icon}</span>
        {children}
      </div>
    </div>
  );
}
