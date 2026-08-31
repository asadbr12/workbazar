import { NextRequest, NextResponse } from "next/server";
import { recruiterRegistrationSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = recruiterRegistrationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid data" },
      { status: 400 }
    );
  }

  const data = parsed.data;

  await prisma.user.update({
    where: { id: session.userId },
    data: { role: "RECRUITER" },
  });

  const profile = await prisma.recruiterProfile.upsert({
    where: { userId: session.userId },
    create: {
      userId: session.userId,
      fullName: data.fullName,
      companyName: data.companyName || null,
      businessType: data.businessType || null,
      gstNumber: data.gstNumber || null,
      photoUrl: data.photoUrl || null,
      officeAddress: data.officeAddress,
      state: data.state,
      district: data.district,
      pincode: data.pincode,
      lat: data.lat ?? null,
      lng: data.lng ?? null,
      serviceAreas: data.serviceAreas,
      workerTypesNeeded: data.workerTypesNeeded,
      budgetRange: data.budgetRange || null,
      paymentTerms: data.paymentTerms || null,
      upiId: data.upiId || null,
      preferredPaymentMethod: data.preferredPaymentMethod || null,
    },
    update: {
      fullName: data.fullName,
      companyName: data.companyName || null,
      businessType: data.businessType || null,
      gstNumber: data.gstNumber || null,
      photoUrl: data.photoUrl || null,
      officeAddress: data.officeAddress,
      state: data.state,
      district: data.district,
      pincode: data.pincode,
      lat: data.lat ?? null,
      lng: data.lng ?? null,
      serviceAreas: data.serviceAreas,
      workerTypesNeeded: data.workerTypesNeeded,
      budgetRange: data.budgetRange || null,
      paymentTerms: data.paymentTerms || null,
      upiId: data.upiId || null,
      preferredPaymentMethod: data.preferredPaymentMethod || null,
    },
  });

  return NextResponse.json({ ok: true, profileId: profile.id });
}
