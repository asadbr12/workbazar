import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MIGRATION_NAME = "20260830010000_worker_search_indexes";
const MIGRATION_CHECKSUM =
  "8e7ea9982cd7f4ccb53597eaea0b8a3661fdf97ffe4009034060e16ec027eb2d";

export async function POST(req: NextRequest) {
  const expected = process.env.MIGRATION_SECRET;
  const provided = req.headers.get("x-migration-secret");
  if (!expected || provided !== expected) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const already = await prisma.$queryRawUnsafe<{ migration_name: string }[]>(
    `SELECT migration_name FROM "_prisma_migrations" WHERE migration_name = $1`,
    MIGRATION_NAME
  );
  if (already.length > 0) {
    return NextResponse.json({ ok: true, alreadyApplied: true });
  }

  const startedAt = new Date();

  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "WorkerProfile_lat_lng_idx" ON "WorkerProfile"("lat", "lng")`
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "WorkerProfile_skills_idx" ON "WorkerProfile" USING GIN ("skills")`
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "Subscription_userId_status_idx" ON "Subscription"("userId", "status")`
  );

  const finishedAt = new Date();

  await prisma.$executeRawUnsafe(
    `INSERT INTO "_prisma_migrations"
      (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
     VALUES (gen_random_uuid()::text, $1, $2, $3, NULL, NULL, $4, 1)`,
    MIGRATION_CHECKSUM,
    finishedAt,
    MIGRATION_NAME,
    startedAt
  );

  return NextResponse.json({ ok: true, applied: MIGRATION_NAME });
}
