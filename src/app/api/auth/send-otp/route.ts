import { NextRequest, NextResponse } from "next/server";
import { sendOtpSchema } from "@/lib/validation";
import { issueOtp, isDemoMode } from "@/lib/otp";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = sendOtpSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid phone number" },
      { status: 400 }
    );
  }

  const { phone } = parsed.data;
  const result = await issueOtp(phone);

  return NextResponse.json({
    ok: true,
    demoMode: isDemoMode(),
    // Only present in demo mode (no SMS provider configured) so the OTP
    // screen can be tested without a real SMS gateway.
    demoCode: result.demoCode,
  });
}
