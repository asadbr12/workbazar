"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { haversineKm } from "@/lib/geo";
import BookingChat from "@/components/BookingChat";

const BookingMap = dynamic(() => import("@/components/BookingMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm text-gray-400">
      Loading map…
    </div>
  ),
});

type BookingStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "DECLINED"
  | "EN_ROUTE"
  | "ARRIVED"
  | "COMPLETED"
  | "CANCELLED";

export type BookingData = {
  id: string;
  skill: string;
  status: BookingStatus;
  destinationLat: number | null;
  destinationLng: number | null;
  destinationAddress: string | null;
  workerLat: number | null;
  workerLng: number | null;
  workerLocationUpdatedAt: string | Date | null;
  rating: number | null;
  ratingComment: string | null;
  recruiter: { id: string; phone: string; recruiterProfile: { fullName: string } | null };
  worker: { id: string; phone: string; workerProfile: { fullName: string } | null };
};

const STATUS_LABEL: Record<BookingStatus, string> = {
  REQUESTED: "Requested · अनुरोध किया गया",
  ACCEPTED: "Accepted · स्वीकृत",
  DECLINED: "Declined · अस्वीकृत",
  EN_ROUTE: "On the way · रास्ते में",
  ARRIVED: "Arrived · पहुँच गए",
  COMPLETED: "Completed · पूर्ण",
  CANCELLED: "Cancelled · रद्द",
};

const STATUS_STEPS: BookingStatus[] = ["REQUESTED", "ACCEPTED", "EN_ROUTE", "ARRIVED", "COMPLETED"];

export default function BookingTracker({
  initialBooking,
  viewerRole,
}: {
  initialBooking: BookingData;
  viewerRole: "RECRUITER" | "WORKER";
}) {
  const [booking, setBooking] = useState(initialBooking);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sharingLocation, setSharingLocation] = useState(false);
  const [ratingStars, setRatingStars] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [ratingLoading, setRatingLoading] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const lastSentRef = useRef<number>(0);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/bookings/${booking.id}`);
        if (!res.ok) return;
        const data = await res.json();
        setBooking(data.booking);
      } catch {
        // transient network error, ignore
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [booking.id]);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  async function setStatus(status: BookingStatus) {
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't update status");
      setBooking(data.booking);

      if (status === "EN_ROUTE") startSharingLocation();
      if (status === "ARRIVED" || status === "COMPLETED") stopSharingLocation();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setActionLoading(false);
    }
  }

  function startSharingLocation() {
    if (!navigator.geolocation) {
      setError("Location isn't supported on this device");
      return;
    }
    setSharingLocation(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const now = Date.now();
        if (now - lastSentRef.current < 4000) return;
        lastSentRef.current = now;
        fetch(`/api/bookings/${booking.id}/location`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        }).catch(() => {});
      },
      () => setError("Couldn't read your location — check location permission"),
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    );
  }

  function stopSharingLocation() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setSharingLocation(false);
  }

  async function submitRating() {
    if (ratingStars === 0) return;
    setRatingLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${booking.id}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stars: ratingStars, comment: ratingComment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't submit rating");
      setBooking(data.booking);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setRatingLoading(false);
    }
  }

  const destination =
    booking.destinationLat !== null && booking.destinationLng !== null
      ? { lat: booking.destinationLat, lng: booking.destinationLng }
      : null;
  const workerPos =
    booking.workerLat !== null && booking.workerLng !== null
      ? { lat: booking.workerLat, lng: booking.workerLng }
      : null;

  const distanceKm =
    destination && workerPos ? haversineKm(destination, workerPos) : null;
  const etaMinutes = distanceKm !== null ? Math.max(1, Math.round((distanceKm / 25) * 60)) : null;

  const counterpartName =
    viewerRole === "RECRUITER"
      ? booking.worker.workerProfile?.fullName ?? "Worker"
      : booking.recruiter.recruiterProfile?.fullName ?? "Recruiter";
  const counterpartPhone = viewerRole === "RECRUITER" ? booking.worker.phone : booking.recruiter.phone;

  const stepIndex = STATUS_STEPS.indexOf(booking.status);
  const isTerminalNegative = booking.status === "DECLINED" || booking.status === "CANCELLED";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">
        Booking — {booking.skill}
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        {viewerRole === "RECRUITER" ? "Worker" : "Recruiter"}: {counterpartName} &middot;{" "}
        <a href={`tel:+91${counterpartPhone}`} className="text-blue-600 hover:underline">
          +91 {counterpartPhone}
        </a>
      </p>

      {!isTerminalNegative ? (
        <div className="mt-6 flex items-center gap-1 overflow-x-auto">
          {STATUS_STEPS.map((step, i) => (
            <div key={step} className="flex items-center">
              <div
                className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                  i <= stepIndex ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
                }`}
              >
                {STATUS_LABEL[step].split(" · ")[0]}
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div className={`h-0.5 w-6 ${i < stepIndex ? "bg-blue-600" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>
      ) : (
        <span className="mt-6 inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
          {STATUS_LABEL[booking.status]}
        </span>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="h-[420px] overflow-hidden rounded-xl border border-gray-200">
          <BookingMap
            destination={destination}
            workerPos={workerPos}
            workerLabel={counterpartName + (viewerRole === "WORKER" ? " (you)" : "")}
            destinationLabel={viewerRole === "RECRUITER" ? "You" : "Job site"}
          />
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-500">Status</p>
            <p className="text-lg font-semibold text-gray-900">
              {STATUS_LABEL[booking.status]}
            </p>
            {distanceKm !== null && (
              <p className="mt-2 text-sm text-gray-600">
                {Math.round(distanceKm * 10) / 10} km away &middot; ~{etaMinutes} min
              </p>
            )}
            {booking.workerLocationUpdatedAt && (
              <p className="mt-1 text-xs text-gray-400">
                Location updated {new Date(booking.workerLocationUpdatedAt).toLocaleTimeString("en-IN")}
              </p>
            )}
          </div>

          {viewerRole === "WORKER" && (
            <div className="space-y-2 rounded-xl border border-gray-200 bg-white p-4">
              {booking.status === "REQUESTED" && (
                <>
                  <button
                    onClick={() => setStatus("ACCEPTED")}
                    disabled={actionLoading}
                    className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    Accept booking
                  </button>
                  <button
                    onClick={() => setStatus("DECLINED")}
                    disabled={actionLoading}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Decline
                  </button>
                </>
              )}
              {booking.status === "ACCEPTED" && (
                <button
                  onClick={() => setStatus("EN_ROUTE")}
                  disabled={actionLoading}
                  className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Start job — share my location
                </button>
              )}
              {booking.status === "EN_ROUTE" && (
                <>
                  <p className="text-xs text-gray-500">
                    {sharingLocation
                      ? "📍 Sharing your live location…"
                      : "Location sharing paused — reopen this page to resume."}
                  </p>
                  <button
                    onClick={() => setStatus("ARRIVED")}
                    disabled={actionLoading}
                    className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    Mark arrived
                  </button>
                </>
              )}
              {booking.status === "ARRIVED" && (
                <button
                  onClick={() => setStatus("COMPLETED")}
                  disabled={actionLoading}
                  className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Mark job completed
                </button>
              )}
            </div>
          )}

          {viewerRole === "RECRUITER" &&
            (booking.status === "REQUESTED" || booking.status === "ACCEPTED") && (
              <button
                onClick={() => setStatus("CANCELLED")}
                disabled={actionLoading}
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel booking
              </button>
            )}

          {viewerRole === "RECRUITER" && booking.status === "COMPLETED" && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              {booking.rating ? (
                <>
                  <p className="text-sm font-semibold text-gray-900">Your rating</p>
                  <p className="mt-1 text-lg text-amber-500">
                    {"★".repeat(booking.rating)}
                    <span className="text-gray-300">{"★".repeat(5 - booking.rating)}</span>
                  </p>
                  {booking.ratingComment && (
                    <p className="mt-1 text-sm text-gray-600">
                      &quot;{booking.ratingComment}&quot;
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-gray-900">
                    Rate {counterpartName}
                  </p>
                  <div className="mt-2 flex gap-1 text-2xl">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRatingStars(n)}
                        className={n <= ratingStars ? "text-amber-500" : "text-gray-300"}
                        aria-label={`${n} star`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    placeholder="Optional comment about the work (optional)"
                    rows={2}
                    className="input mt-2"
                  />
                  <button
                    onClick={submitRating}
                    disabled={ratingStars === 0 || ratingLoading}
                    className="mt-2 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {ratingLoading ? "Submitting..." : "Submit rating"}
                  </button>
                </>
              )}
            </div>
          )}

          <BookingChat
            bookingId={booking.id}
            viewerId={viewerRole === "RECRUITER" ? booking.recruiter.id : booking.worker.id}
          />
        </div>
      </div>
    </div>
  );
}
