import { NextRequest, NextResponse } from "next/server";
import { createBookingSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid data" },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const worker = await prisma.workerProfile.findUnique({
    where: { userId: data.workerUserId },
  });
  if (!worker) {
    return NextResponse.json({ error: "Worker not found" }, { status: 404 });
  }

  const booking = await prisma.booking.create({
    data: {
      recruiterId: session.userId,
      workerId: data.workerUserId,
      skill: data.skill,
      destinationLat: data.destinationLat ?? null,
      destinationLng: data.destinationLng ?? null,
      destinationAddress: data.destinationAddress || null,
    },
  });

  return NextResponse.json({ ok: true, booking });
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const bookings = await prisma.booking.findMany({
    where: {
      OR: [{ recruiterId: session.userId }, { workerId: session.userId }],
    },
    include: {
      recruiter: { select: { id: true, phone: true, recruiterProfile: true } },
      worker: { select: { id: true, phone: true, workerProfile: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ ok: true, bookings });
}
