import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const mod = await import("firebase-admin/app");
    return NextResponse.json({ debug: "dynamic-import-succeeded", keys: Object.keys(mod) });
  } catch (err) {
    return NextResponse.json(
      {
        debug: "dynamic-import-failed",
        name: err instanceof Error ? err.name : typeof err,
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      },
      { status: 500 }
    );
  }
}
