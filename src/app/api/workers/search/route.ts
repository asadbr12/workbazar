import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { SKILL_OPTIONS } from "@/lib/validation";
import {
  findNearbyWorkers,
  SEARCH_RADIUS_OPTIONS,
  DEFAULT_SEARCH_RADIUS_KM,
} from "@/lib/workers";

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

  const radiusParam = Number(searchParams.get("radiusKm"));
  const radiusKm = (SEARCH_RADIUS_OPTIONS as readonly number[]).includes(radiusParam)
    ? radiusParam
    : DEFAULT_SEARCH_RADIUS_KM;

  if (!q) {
    return NextResponse.json({ ok: true, matchedSkills: [], workers: [], radiusKm });
  }

  const matchedSkills = SKILL_OPTIONS.filter(
    (skill) => skill.toLowerCase().includes(q) || q.includes(skill.toLowerCase())
  );

  if (matchedSkills.length === 0) {
    return NextResponse.json({ ok: true, matchedSkills: [], workers: [], radiusKm });
  }

  const { workers, boundedByLocation } = await findNearbyWorkers({
    matchSkills: matchedSkills,
    origin: hasOrigin ? { lat: lat!, lng: lng! } : null,
    radiusKm,
  });

  return NextResponse.json({ ok: true, matchedSkills, workers, radiusKm, boundedByLocation });
}
