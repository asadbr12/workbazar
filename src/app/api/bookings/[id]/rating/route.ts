import { NextRequest, NextResponse } from "next/server";
import { bookingRatingSchema } from "@/lib/validation";
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
  if (booking.recruiterId !== session.userId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }
  if (booking.status !== "COMPLETED") {
    return NextResponse.json(
      { error: "You can only rate a completed booking" },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = bookingRatingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid rating" },
      { status: 400 }
    );
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: {
      rating: parsed.data.stars,
      ratingComment: parsed.data.comment || null,
      ratedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true, booking: updated });
}
