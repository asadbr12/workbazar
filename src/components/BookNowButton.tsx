"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BookNowButton({
  workerUserId,
  skill,
  destinationLat,
  destinationLng,
}: {
  workerUserId: string;
  skill: string;
  destinationLat?: number | null;
  destinationLng?: number | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBook() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workerUserId,
          skill,
          destinationLat: destinationLat ?? undefined,
          destinationLng: destinationLng ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't create booking");
      router.push(`/bookings/${data.booking.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleBook}
        disabled={loading}
        className="mt-2 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Booking..." : "Book Now"}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
