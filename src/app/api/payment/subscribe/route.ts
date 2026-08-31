import { NextRequest, NextResponse } from "next/server";
import { subscribeSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const PLAN_AMOUNT_INR = 99;
const isRazorpayConfigured = () =>
  Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
// Same umbrella demo-mode flag used to bypass Firebase OTP — when it's on,
// skip real Razorpay too so a full demo (signup -> payment -> dashboard)
// never touches a live integration, even though real test keys are set.
const isDemoModeEnabled = () => process.env.NEXT_PUBLIC_DEMO_OTP_ENABLED === "true";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = subscribeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid payment method" },
      { status: 400 }
    );
  }

  const { paymentMethod } = parsed.data;

  if (!isRazorpayConfigured() || isDemoModeEnabled()) {
    // Demo mode: no Razorpay keys configured (or demo mode explicitly on),
    // simulate an instantly successful payment so the full flow can be
    // tested end to end.
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const subscription = await prisma.subscription.create({
      data: {
        userId: session.userId,
        amount: PLAN_AMOUNT_INR,
        status: "ACTIVE",
        paymentMethod: `${paymentMethod}_DEMO`,
        transactionId: `DEMO-${Date.now()}`,
        startDate,
        endDate,
      },
    });

    return NextResponse.json({
      ok: true,
      demoMode: true,
      subscriptionId: subscription.id,
      status: subscription.status,
    });
  }

  const Razorpay = (await import("razorpay")).default;
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

  const order = await razorpay.orders.create({
    amount: PLAN_AMOUNT_INR * 100,
    currency: "INR",
    receipt: `wb_${session.userId}_${Date.now()}`,
  });

  const subscription = await prisma.subscription.create({
    data: {
      userId: session.userId,
      amount: PLAN_AMOUNT_INR,
      status: "PENDING",
      paymentMethod,
      razorpayOrderId: order.id,
    },
  });

  return NextResponse.json({
    ok: true,
    demoMode: false,
    subscriptionId: subscription.id,
    razorpayOrderId: order.id,
    razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    amount: PLAN_AMOUNT_INR * 100,
    currency: "INR",
  });
}
