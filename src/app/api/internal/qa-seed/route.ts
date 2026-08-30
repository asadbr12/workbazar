import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const BASE_LAT = 25.197;
const BASE_LNG = 85.5209;

const FIXTURES = [
  {
    phone: "5000000001",
    fullName: "QA Active InRange",
    lat: BASE_LAT + 0.009,
    lng: BASE_LNG,
    skills: ["Plumber"],
    travelDistanceKm: 10,
    subStatus: "ACTIVE" as const,
    subEndDate: new Date(Date.now() + 30 * 86400000),
  },
  {
    phone: "5000000002",
    fullName: "QA Expired InRange",
    lat: BASE_LAT + 0.009,
    lng: BASE_LNG,
    skills: ["Plumber"],
    travelDistanceKm: 10,
    subStatus: "ACTIVE" as const,
    subEndDate: new Date(Date.now() - 1 * 86400000),
  },
  {
    phone: "5000000003",
    fullName: "QA Active FarFromCustomer",
    lat: BASE_LAT + 0.063,
    lng: BASE_LNG,
    skills: ["Plumber"],
    travelDistanceKm: 10,
    subStatus: "ACTIVE" as const,
    subEndDate: new Date(Date.now() + 30 * 86400000),
  },
  {
    phone: "5000000004",
    fullName: "QA Active SmallOwnRadius",
    lat: BASE_LAT + 0.027,
    lng: BASE_LNG,
    skills: ["Plumber"],
    travelDistanceKm: 1,
    subStatus: "ACTIVE" as const,
    subEndDate: new Date(Date.now() + 30 * 86400000),
  },
  {
    phone: "5000000005",
    fullName: "QA Active WrongSkill",
    lat: BASE_LAT + 0.009,
    lng: BASE_LNG,
    skills: ["Electrician"],
    travelDistanceKm: 10,
    subStatus: "ACTIVE" as const,
    subEndDate: new Date(Date.now() + 30 * 86400000),
  },
];

export async function POST(req: NextRequest) {
  const expected = process.env.MIGRATION_SECRET;
  const provided = req.headers.get("x-migration-secret");
  if (!expected || provided !== expected) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const created = [];
  for (const f of FIXTURES) {
    const user = await prisma.user.upsert({
      where: { phone: f.phone },
      create: { phone: f.phone, role: "WORKER" },
      update: {},
    });
    await prisma.workerProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        fullName: f.fullName,
        age: 30,
        gender: "MALE",
        address: "QA Test Address",
        pincode: "803101",
        lat: f.lat,
        lng: f.lng,
        skills: f.skills,
        experienceYears: 5,
        availability: "BOTH",
        travelDistanceKm: f.travelDistanceKm,
        photoUrl: "https://example.com/qa.jpg",
      },
      update: {
        fullName: f.fullName,
        lat: f.lat,
        lng: f.lng,
        skills: f.skills,
        travelDistanceKm: f.travelDistanceKm,
      },
    });
    await prisma.subscription.deleteMany({ where: { userId: user.id } });
    await prisma.subscription.create({
      data: {
        userId: user.id,
        status: f.subStatus,
        startDate: new Date(Date.now() - 5 * 86400000),
        endDate: f.subEndDate,
      },
    });
    created.push({ phone: f.phone, userId: user.id });
  }

  return NextResponse.json({ ok: true, created, baseLat: BASE_LAT, baseLng: BASE_LNG });
}

export async function DELETE(req: NextRequest) {
  const expected = process.env.MIGRATION_SECRET;
  const provided = req.headers.get("x-migration-secret");
  if (!expected || provided !== expected) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const phones = FIXTURES.map((f) => f.phone);
  const users = await prisma.user.findMany({ where: { phone: { in: phones } } });
  const userIds = users.map((u) => u.id);

  await prisma.subscription.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.workerProfile.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });

  return NextResponse.json({ ok: true, deletedUsers: userIds.length });
}
