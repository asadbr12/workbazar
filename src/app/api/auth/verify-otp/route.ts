import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseTokenSchema } from "@/lib/validation";
import { firebaseAdminAuth } from "@/lib/firebase-admin";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { hasActiveSubscription } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = verifyFirebaseTokenSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const { idToken, role } = parsed.data;

  let decoded;
  try {
    decoded = await firebaseAdminAuth.verifyIdToken(idToken);
  } catch (err) {
    console.error("Firebase token verification failed:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 400 });
  }

  const rawPhone = decoded.phone_number;
  if (!rawPhone || !rawPhone.startsWith("+91")) {
    return NextResponse.json({ error: "Verification failed" }, { status: 400 });
  }
  const phone = rawPhone.slice(3);

  let user = await prisma.user.findUnique({
    where: { phone },
    include: {
      workerProfile: true,
      recruiterProfile: true,
      subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: { phone, role },
      include: {
        workerProfile: true,
        recruiterProfile: true,
        subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
  } else if (!user.role && role) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { role },
      include: {
        workerProfile: true,
        recruiterProfile: true,
        subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
  }

  await createSession({ userId: user.id });

  const hasProfile = Boolean(user.workerProfile || user.recruiterProfile);

  return NextResponse.json({
    ok: true,
    role: user.role,
    hasProfile,
    hasActiveSubscription: hasActiveSubscription(user.subscriptions),
  });
}
