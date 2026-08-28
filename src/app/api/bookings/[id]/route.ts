import { NextRequest, NextResponse } from "next/server";
import { bookingStatusSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

async function loadBooking(id: string, userId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      recruiter: { select: { id: true, phone: true, recruiterProfile: true } },
      worker: { select: { id: true, phone: true, workerProfile: true } },
    },
  });
  if (!booking) return null;
  if (booking.recruiterId !== userId && booking.workerId !== userId) return "forbidden" as const;
  return booking;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const booking = await loadBooking(id, session.userId);
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (booking === "forbidden") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  return NextResponse.json({ ok: true, booking, viewerRole: booking.recruiterId === session.userId ? "RECRUITER" : "WORKER" });
}

const WORKER_TRANSITIONS = new Set(["ACCEPTED", "DECLINED", "EN_ROUTE", "ARRIVED", "COMPLETED"]);
const RECRUITER_TRANSITIONS = new Set(["CANCELLED"]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const booking = await loadBooking(id, session.userId);
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (booking === "forbidden") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = bookingStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid status" },
      { status: 400 }
    );
  }

  const { status } = parsed.data;
  const isWorker = booking.workerId === session.userId;
  const isRecruiter = booking.recruiterId === session.userId;

  const allowed =
    (isWorker && WORKER_TRANSITIONS.has(status)) ||
    (isRecruiter && RECRUITER_TRANSITIONS.has(status));

  if (!allowed) {
    return NextResponse.json({ error: "Not allowed to set this status" }, { status: 403 });
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json({ ok: true, booking: updated });
}
