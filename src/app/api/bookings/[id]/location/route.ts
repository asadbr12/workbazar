import { NextRequest, NextResponse } from "next/server";
import { bookingLocationSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (booking.workerId !== session.userId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }
  if (booking.status !== "EN_ROUTE") {
    return NextResponse.json(
      { error: "Booking is not en route" },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = bookingLocationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid location" },
      { status: 400 }
    );
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: {
      workerLat: parsed.data.lat,
      workerLng: parsed.data.lng,
      workerLocationUpdatedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true, booking: updated });
}
