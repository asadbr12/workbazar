import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdminAuth } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  return NextResponse.json({ debug: "firebase-admin-imported-not-called", type: typeof getFirebaseAdminAuth });
}
