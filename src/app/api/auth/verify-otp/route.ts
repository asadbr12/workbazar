import { NextRequest, NextResponse } from "next/server";
import { verifyOtpSchema } from "@/lib/validation";
import { verifyOtp } from "@/lib/otp";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { hasActiveSubscription } from "@/lib/auth";

const REASON_MESSAGES: Record<string, string> = {
  not_found: "Request a new OTP before verifying",
  expired: "This OTP has expired, request a new one",
  too_many_attempts: "Too many incorrect attempts, request a new OTP",
  incorrect: "Incorrect OTP",
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = verifyOtpSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const { phone, code, role } = parsed.data;
  const result = await verifyOtp(phone, code);

  if (!result.ok) {
    return NextResponse.json(
      { error: REASON_MESSAGES[result.reason] ?? "Verification failed" },
      { status: 400 }
    );
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
    role: user.role,
    hasProfile,
    hasActiveSubscription: hasActiveSubscription(user.subscriptions),
  });
}
