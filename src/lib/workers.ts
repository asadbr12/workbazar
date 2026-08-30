import { prisma } from "@/lib/prisma";
import { haversineKm } from "@/lib/geo";
import { getWorkerRatingStats } from "@/lib/ratings";
import type { Prisma } from "@prisma/client";

export const SEARCH_RADIUS_OPTIONS = [2, 5, 10, 20] as const;
export const DEFAULT_SEARCH_RADIUS_KM: number = 5;

export type WorkerSearchResult = {
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

const workerWithUser = {
  include: { user: { select: { id: true, phone: true } } },
} satisfies Prisma.WorkerProfileDefaultArgs;

type WorkerRow = Prisma.WorkerProfileGetPayload<typeof workerWithUser>;

// Any subscription row currently valid, not just the latest one -- see
// src/lib/auth.ts hasActiveSubscription() for the equivalent JS-side check
// used elsewhere. These agree under the normal create-new-row-per-cycle
// flow (subscribe/route.ts always creates, never updates), but this form
// is intentionally more permissive: a stray FAILED retry row created after
// a still-valid ACTIVE row won't incorrectly hide a paying worker here.
const activeSubscriptionFilter = {
  some: {
    status: "ACTIVE" as const,
    OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
  },
};

export async function findNearbyWorkers(params: {
  matchSkills: string[];
  origin: { lat: number; lng: number } | null;
  radiusKm: number;
  limit?: number;
}): Promise<{ workers: WorkerSearchResult[]; boundedByLocation: boolean }> {
  const { matchSkills, origin, radiusKm, limit = 60 } = params;

  const baseWhere: Prisma.WorkerProfileWhereInput = {
    skills: { hasSome: matchSkills },
    user: { subscriptions: activeSubscriptionFilter },
  };

  if (!origin) {
    const rows = await prisma.workerProfile.findMany({
      where: baseWhere,
      ...workerWithUser,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return { workers: await shapeResults(rows, matchSkills, null), boundedByLocation: false };
  }

  const latDelta = radiusKm / 111;
  const lngDelta = radiusKm / (111 * Math.max(Math.cos((origin.lat * Math.PI) / 180), 0.1));

  const rows = await prisma.workerProfile.findMany({
    where: {
      ...baseWhere,
      lat: { gte: origin.lat - latDelta, lte: origin.lat + latDelta },
      lng: { gte: origin.lng - lngDelta, lte: origin.lng + lngDelta },
    },
    ...workerWithUser,
  });

  const shaped = await shapeResults(rows, matchSkills, origin);

  const withinRadius = shaped
    .filter((w) => w.distanceKm !== null && w.distanceKm <= radiusKm)
    .sort((a, b) => (a.distanceKm as number) - (b.distanceKm as number))
    .slice(0, limit);

  return { workers: withinRadius, boundedByLocation: true };
}

async function shapeResults(
  rows: WorkerRow[],
  matchSkills: string[],
  origin: { lat: number; lng: number } | null
): Promise<WorkerSearchResult[]> {
  // Intersection rule: a worker must be within the CUSTOMER's chosen radius
  // (filtered by caller) AND within their OWN stated travelDistanceKm.
  const filtered = origin
    ? rows.filter((w) => {
        if (w.lat === null || w.lng === null) return false;
        return haversineKm(origin, { lat: w.lat, lng: w.lng }) <= w.travelDistanceKm;
      })
    : rows;

  const ratingStats = await getWorkerRatingStats(filtered.map((w) => w.user.id));

  return filtered.map((w) => {
    const distanceKm =
      origin && w.lat !== null && w.lng !== null
        ? Math.round(haversineKm(origin, { lat: w.lat, lng: w.lng }) * 10) / 10
        : null;
    return {
      workerUserId: w.user.id,
      fullName: w.fullName,
      skills: w.skills,
      matchedSkills: w.skills.filter((s) => matchSkills.includes(s)),
      pincode: w.pincode,
      experienceYears: w.experienceYears,
      feePerDay: w.feePerDay,
      feePerHour: w.feePerHour,
      photoUrl: w.photoUrl,
      availability: w.availability,
      phone: w.user.phone,
      distanceKm,
      rating: ratingStats[w.user.id]?.avg ?? 0,
      ratingCount: ratingStats[w.user.id]?.count ?? 0,
    };
  });
}
