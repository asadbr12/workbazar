import { NextRequest, NextResponse } from "next/server";
import { sendMessageSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

async function loadBooking(id: string, userId: string) {
  const booking = await prisma.booking.findUnique({ where: { id } });
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

  const isRecruiter = booking.recruiterId === session.userId;

  const messages = await prisma.message.findMany({
    where: { bookingId: id },
    orderBy: { createdAt: "asc" },
  });

  // Mark read on open.
  await prisma.booking.update({
    where: { id },
    data: isRecruiter ? { recruiterReadAt: new Date() } : { workerReadAt: new Date() },
  });

  return NextResponse.json({ ok: true, messages, viewerId: session.userId });
}

export async function POST(
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
  const parsed = sendMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid message" },
      { status: 400 }
    );
  }

  const isRecruiter = booking.recruiterId === session.userId;

  const message = await prisma.message.create({
    data: {
      bookingId: id,
      senderId: session.userId,
      body: parsed.data.body,
    },
  });

  // Sending also counts as having read up to now.
  await prisma.booking.update({
    where: { id },
    data: isRecruiter ? { recruiterReadAt: new Date() } : { workerReadAt: new Date() },
  });

  return NextResponse.json({ ok: true, message });
}
