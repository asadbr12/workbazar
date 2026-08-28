import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { hasActiveSubscription } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const subscriptions = await prisma.subscription.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 1,
  });

  const latest = subscriptions[0] ?? null;

  return NextResponse.json({
    active: hasActiveSubscription(subscriptions),
    subscription: latest,
  });
}
