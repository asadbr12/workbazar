import { prisma } from "@/lib/prisma";

export type RatingStats = { avg: number; count: number };

export async function getWorkerRatingStats(
  workerUserIds: string[]
): Promise<Record<string, RatingStats>> {
  if (workerUserIds.length === 0) return {};

  const grouped = await prisma.booking.groupBy({
    by: ["workerId"],
    where: { workerId: { in: workerUserIds }, rating: { not: null } },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const stats: Record<string, RatingStats> = {};
  for (const row of grouped) {
    stats[row.workerId] = {
      avg: Math.round((row._avg.rating ?? 0) * 10) / 10,
      count: row._count.rating,
    };
  }
  return stats;
}
