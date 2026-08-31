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
  district: string | null;
  matchedByDistrict: boolean;
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
  district?: string | null;
  limit?: number;
}): Promise<{ workers: WorkerSearchResult[]; boundedByLocation: boolean }> {
  const { matchSkills, origin, radiusKm, district = null, limit = 60 } = params;

  const baseWhere: Prisma.WorkerProfileWhereInput = {
    skills: { hasSome: matchSkills },
    user: { subscriptions: activeSubscriptionFilter },
  };

  if (!origin && !district) {
    const rows = await prisma.workerProfile.findMany({
      where: baseWhere,
      ...workerWithUser,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return {
      workers: await shapeResults(rows, matchSkills, null, null),
      boundedByLocation: false,
    };
  }

  // Match either GPS proximity or same district — a worker can show up via
  // either path, e.g. a recruiter with no location shared still sees
  // same-district workers, and a GPS match still surfaces workers just
  // outside the radius if they're in the recruiter's own district.
  const locationOr: Prisma.WorkerProfileWhereInput[] = [];
  if (origin) {
    const latDelta = radiusKm / 111;
    const lngDelta = radiusKm / (111 * Math.max(Math.cos((origin.lat * Math.PI) / 180), 0.1));
    locationOr.push({
      lat: { gte: origin.lat - latDelta, lte: origin.lat + latDelta },
      lng: { gte: origin.lng - lngDelta, lte: origin.lng + lngDelta },
    });
  }
  if (district) locationOr.push({ district });

  const rows = await prisma.workerProfile.findMany({
    where: { ...baseWhere, OR: locationOr },
    ...workerWithUser,
  });

  const shaped = await shapeResults(rows, matchSkills, origin, district);

  const matched = shaped
    .filter((w) => (w.distanceKm !== null ? w.distanceKm <= radiusKm || w.matchedByDistrict : w.matchedByDistrict))
    .sort((a, b) => {
      if (a.distanceKm !== null && b.distanceKm !== null) return a.distanceKm - b.distanceKm;
      if (a.distanceKm !== null) return -1;
      if (b.distanceKm !== null) return 1;
      return 0;
    })
    .slice(0, limit);

  return { workers: matched, boundedByLocation: Boolean(origin) };
}

async function shapeResults(
  rows: WorkerRow[],
  matchSkills: string[],
  origin: { lat: number; lng: number } | null,
  district: string | null
): Promise<WorkerSearchResult[]> {
  // Intersection rule for GPS matches: a worker must be within the
  // CUSTOMER's chosen radius (filtered by caller) AND within their OWN
  // stated travelDistanceKm. Workers with no coordinates skip this check
  // entirely and rely solely on the district match instead.
  const filtered = origin
    ? rows.filter((w) => {
        if (w.lat === null || w.lng === null) return district !== null && w.district === district;
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
      district: w.district,
      matchedByDistrict: district !== null && w.district === district,
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
