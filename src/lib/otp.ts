import { prisma } from "@/lib/prisma";

const OTP_TTL_MINUTES = 5;
const MAX_VERIFY_ATTEMPTS = 5;

export const isDemoMode = () => !process.env.SMS_PROVIDER_API_KEY;

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function issueOtp(phone: string) {
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await prisma.otpCode.create({
    data: { phone, code, expiresAt },
  });

  if (isDemoMode()) {
    // No SMS provider configured: log to the server console so it's easy
    // to find during local development instead of silently failing.
    console.log(`[Work Bazar demo OTP] ${phone} -> ${code}`);
    return { demoCode: code };
  }

  // TODO: integrate a real SMS provider (e.g. MSG91, Twilio) here using
  // process.env.SMS_PROVIDER_API_KEY.
  return {};
}

type VerifyResult =
  | { ok: true }
  | { ok: false; reason: "not_found" | "expired" | "too_many_attempts" | "incorrect" };

export async function verifyOtp(phone: string, code: string): Promise<VerifyResult> {
  const otp = await prisma.otpCode.findFirst({
    where: { phone, verified: false },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) return { ok: false, reason: "not_found" };
  if (otp.attempts >= MAX_VERIFY_ATTEMPTS) return { ok: false, reason: "too_many_attempts" };
  if (otp.expiresAt < new Date()) return { ok: false, reason: "expired" };

  if (otp.code !== code) {
    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false, reason: "incorrect" };
  }

  await prisma.otpCode.update({
    where: { id: otp.id },
    data: { verified: true },
  });

  return { ok: true };
}
