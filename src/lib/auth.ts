import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      workerProfile: true,
      recruiterProfile: true,
      subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return user;
}

export function hasActiveSubscription(
  subscriptions: { status: string; endDate: Date | null }[]
) {
  const latest = subscriptions[0];
  if (!latest) return false;
  if (latest.status !== "ACTIVE") return false;
  if (latest.endDate && latest.endDate < new Date()) return false;
  return true;
}
