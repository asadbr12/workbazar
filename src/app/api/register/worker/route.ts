import { NextRequest, NextResponse } from "next/server";
import { workerRegistrationSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = workerRegistrationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid data" },
      { status: 400 }
    );
  }

  const data = parsed.data;

  await prisma.user.update({
    where: { id: session.userId },
    data: { role: "WORKER" },
  });

  const profile = await prisma.workerProfile.upsert({
    where: { userId: session.userId },
    create: {
      userId: session.userId,
      fullName: data.fullName,
      age: data.age,
      gender: data.gender,
      address: data.address,
      state: data.state,
      district: data.district,
      town: data.town || null,
      pincode: data.pincode,
      aadharNumber: data.aadharNumber || null,
      lat: data.lat ?? null,
      lng: data.lng ?? null,
      photoUrl: data.photoUrl,
      skills: data.skills,
      experienceYears: data.experienceYears,
      feePerDay: data.feePerDay ?? null,
      feePerHour: data.feePerHour ?? null,
      availability: data.availability,
      travelDistanceKm: data.travelDistanceKm,
      upiId: data.upiId || null,
      accountNumber: data.accountNumber || null,
    },
    update: {
      fullName: data.fullName,
      age: data.age,
      gender: data.gender,
      address: data.address,
      state: data.state,
      district: data.district,
      town: data.town || null,
      pincode: data.pincode,
      aadharNumber: data.aadharNumber || null,
      lat: data.lat ?? null,
      lng: data.lng ?? null,
      photoUrl: data.photoUrl,
      skills: data.skills,
      experienceYears: data.experienceYears,
      feePerDay: data.feePerDay ?? null,
      feePerHour: data.feePerHour ?? null,
      availability: data.availability,
      travelDistanceKm: data.travelDistanceKm,
      upiId: data.upiId || null,
      accountNumber: data.accountNumber || null,
    },
  });

  return NextResponse.json({ ok: true, profileId: profile.id });
}
