import { NextRequest, NextResponse } from "next/server";
import { demoLoginSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { hasActiveSubscription } from "@/lib/auth";

const DEMO_OTP_CODE = "123456";

export async function POST(req: NextRequest) {
  if (process.env.NEXT_PUBLIC_DEMO_OTP_ENABLED !== "true") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = demoLoginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const { phone, code, role } = parsed.data;

  if (code !== DEMO_OTP_CODE) {
    return NextResponse.json({ error: "Incorrect OTP" }, { status: 400 });
  }

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
    demoMode: true,
    role: user.role,
    hasProfile,
    hasActiveSubscription: hasActiveSubscription(user.subscriptions),
  });
}
