"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StarRating from "@/components/StarRating";
import { formatFee } from "@/lib/format";

type WorkerResult = {
  workerUserId: string;
  fullName: string;
  skills: string[];
  matchedSkills: string[];
  pincode: string;
  experienceYears: number;
  feePerDay: number | null;
  feePerHour: number | null;
  photoUrl: string | null;
  availability: string;
  phone: string;
  distanceKm: number | null;
  rating: number;
  ratingCount: number;
};

const RADIUS_OPTIONS = [2, 5, 10, 20] as const;

export default function SearchClient({
  initialQuery,
  profileLat,
  profileLng,
}: {
  initialQuery: string;
  profileLat: number | null;
  profileLng: number | null;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(
    profileLat !== null && profileLng !== null ? { lat: profileLat, lng: profileLng } : null
  );
  const [locating, setLocating] = useState(false);
  const [results, setResults] = useState<WorkerResult[] | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(5);

  useEffect(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runSearch(
    q: string,
    loc: { lat: number; lng: number } | null,
    radius: number = radiusKm
  ) {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const params = new URLSearchParams({ q, radiusKm: String(radius) });
      if (loc) {
        params.set("lat", String(loc.lat));
        params.set("lng", String(loc.lng));
      }
      const res = await fetch(`/api/workers/search?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Search failed");
      setResults(data.workers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialQuery) runSearch(initialQuery, origin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locating]);

  async function handleBook(worker: WorkerResult) {
    setBookingId(worker.workerUserId);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workerUserId: worker.workerUserId,
          skill: worker.matchedSkills[0] ?? worker.skills[0],
          destinationLat: origin?.lat,
          destinationLng: origin?.lng,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't create booking");
      router.push(`/bookings/${data.booking.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBookingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">
        Search workers
        <span className="ml-2 text-base font-normal text-gray-500">
          वर्कर खोजें
        </span>
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Search a skill, e.g. &quot;Electrician&quot; — nearest available workers
        show first, with phone and fee.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          runSearch(query, origin);
        }}
        className="mt-6 flex gap-2"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a skill — e.g. Electrician, Cook, Math Teacher"
          className="input"
        />
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      <p className="mt-2 text-xs text-gray-400">
        {locating
          ? "Getting your location to sort by distance…"
          : origin
            ? "Sorting by distance from your location."
            : "Location unavailable — showing results without distance."}
      </p>

      {origin && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Search radius:</span>
          {RADIUS_OPTIONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setRadiusKm(r);
                if (query.trim()) runSearch(query, origin, r);
              }}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                radiusKm === r
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {r} km
            </button>
          ))}
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {searched && !loading && results !== null && results.length === 0 && (
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
          <p>
            No workers found for &quot;{query}&quot;
            {origin ? ` within ${radiusKm} km` : ""}.
          </p>
          {origin && radiusKm < RADIUS_OPTIONS[RADIUS_OPTIONS.length - 1] && (
            <button
              type="button"
              onClick={() => {
                const next = RADIUS_OPTIONS.find((r) => r > radiusKm) ?? radiusKm;
                setRadiusKm(next);
                runSearch(query, origin, next);
              }}
              className="mt-3 rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Search within {RADIUS_OPTIONS.find((r) => r > radiusKm)} km
            </button>
          )}
        </div>
      )}

      {results && results.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((w) => (
            <div key={w.workerUserId} className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-3">
                {w.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={w.photoUrl}
                    alt={w.fullName}
                    className="h-12 w-12 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100 text-lg text-gray-400">
                    👤
                  </span>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{w.fullName}</h3>
                  <StarRating avg={w.rating} count={w.ratingCount} />
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {w.matchedSkills.join(", ")} &middot; {w.experienceYears} yrs
              </p>
              <p className="mt-1 text-sm font-medium text-gray-700">
                {w.distanceKm !== null ? `${w.distanceKm} km away` : `Pincode ${w.pincode}`}
              </p>
              <p className="mt-1 text-sm text-blue-700">
                {formatFee(w.feePerDay, w.feePerHour)}
              </p>

              <div className="mt-4 flex gap-2">
                <a
                  href={`tel:+91${w.phone}`}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Call +91 {w.phone}
                </a>
                <button
                  onClick={() => handleBook(w)}
                  disabled={bookingId === w.workerUserId}
                  className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {bookingId === w.workerUserId ? "Booking..." : "Book Now"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
