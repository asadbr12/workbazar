import { NextResponse } from "next/server";
import { getCurrentUser, hasActiveSubscription } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const fullName = user.workerProfile?.fullName ?? user.recruiterProfile?.fullName ?? null;
  const photoUrl = user.workerProfile?.photoUrl ?? user.recruiterProfile?.photoUrl ?? null;

  return NextResponse.json({
    user: {
      id: user.id,
      phone: user.phone,
      role: user.role,
      fullName,
      photoUrl,
      hasProfile: Boolean(user.workerProfile || user.recruiterProfile),
      hasActiveSubscription: hasActiveSubscription(user.subscriptions),
    },
  });
}
