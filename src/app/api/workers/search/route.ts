import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { SKILL_OPTIONS } from "@/lib/validation";
import { haversineKm } from "@/lib/geo";
import { getWorkerRatingStats } from "@/lib/ratings";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const lat = latParam ? Number(latParam) : null;
  const lng = lngParam ? Number(lngParam) : null;
  const hasOrigin = lat !== null && lng !== null && !Number.isNaN(lat) && !Number.isNaN(lng);

  if (!q) {
    return NextResponse.json({ ok: true, matchedSkills: [], workers: [] });
  }

  const matchedSkills = SKILL_OPTIONS.filter(
    (skill) => skill.toLowerCase().includes(q) || q.includes(skill.toLowerCase())
  );

  if (matchedSkills.length === 0) {
    return NextResponse.json({ ok: true, matchedSkills: [], workers: [] });
  }

  const workers = await prisma.workerProfile.findMany({
    where: { skills: { hasSome: matchedSkills } },
    include: { user: { select: { id: true, phone: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const ratingStats = await getWorkerRatingStats(workers.map((w) => w.user.id));

  const results = workers
    .map((w) => {
      const distanceKm =
        hasOrigin && w.lat !== null && w.lng !== null
          ? haversineKm({ lat: lat!, lng: lng! }, { lat: w.lat, lng: w.lng })
          : null;
      return {
        workerUserId: w.user.id,
        fullName: w.fullName,
        skills: w.skills,
        matchedSkills: w.skills.filter((s) => (matchedSkills as readonly string[]).includes(s)),
        pincode: w.pincode,
        experienceYears: w.experienceYears,
        feePerDay: w.feePerDay,
        feePerHour: w.feePerHour,
        photoUrl: w.photoUrl,
        availability: w.availability,
        phone: w.user.phone,
        distanceKm: distanceKm === null ? null : Math.round(distanceKm * 10) / 10,
        rating: ratingStats[w.user.id]?.avg ?? 0,
        ratingCount: ratingStats[w.user.id]?.count ?? 0,
      };
    })
    .sort((a, b) => {
      if (a.distanceKm === null && b.distanceKm === null) return 0;
      if (a.distanceKm === null) return 1;
      if (b.distanceKm === null) return -1;
      return a.distanceKm - b.distanceKm;
    });

  return NextResponse.json({ ok: true, matchedSkills, workers: results });
}
