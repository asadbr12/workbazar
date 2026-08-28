import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = body ?? {};

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Razorpay is not configured" }, { status: 500 });
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    await prisma.subscription.updateMany({
      where: { userId: session.userId, razorpayOrderId: razorpay_order_id },
      data: { status: "FAILED" },
    });
    return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
  }

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);

  await prisma.subscription.updateMany({
    where: { userId: session.userId, razorpayOrderId: razorpay_order_id },
    data: {
      status: "ACTIVE",
      transactionId: razorpay_payment_id,
      startDate,
      endDate,
    },
  });

  return NextResponse.json({ ok: true });
}
