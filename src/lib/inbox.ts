import { prisma } from "@/lib/prisma";

export type InboxThread = {
  bookingId: string;
  skill: string;
  status: string;
  counterpartName: string;
  counterpartPhone: string;
  lastMessage: { body: string; createdAt: Date; senderId: string } | null;
  unread: boolean;
  updatedAt: Date;
};

export async function getInboxThreads(
  userId: string,
  role: "WORKER" | "RECRUITER"
): Promise<InboxThread[]> {
  const bookings = await prisma.booking.findMany({
    where: role === "WORKER" ? { workerId: userId } : { recruiterId: userId },
    include: {
      recruiter: { select: { phone: true, recruiterProfile: true } },
      worker: { select: { phone: true, workerProfile: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return bookings
    .map((b) => {
      const last = b.messages[0] ?? null;
      const myReadAt = role === "WORKER" ? b.workerReadAt : b.recruiterReadAt;
      const unread = Boolean(
        last && last.senderId !== userId && (!myReadAt || last.createdAt > myReadAt)
      );
      const counterpartName =
        role === "WORKER"
          ? (b.recruiter.recruiterProfile?.fullName ?? "Recruiter")
          : (b.worker.workerProfile?.fullName ?? "Worker");
      const counterpartPhone = role === "WORKER" ? b.recruiter.phone : b.worker.phone;

      return {
        bookingId: b.id,
        skill: b.skill,
        status: b.status,
        counterpartName,
        counterpartPhone,
        lastMessage: last ? { body: last.body, createdAt: last.createdAt, senderId: last.senderId } : null,
        unread,
        updatedAt: last?.createdAt ?? b.updatedAt,
      };
    })
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

export async function getUnreadInboxCount(
  userId: string,
  role: "WORKER" | "RECRUITER"
): Promise<number> {
  const threads = await getInboxThreads(userId, role);
  return threads.filter((t) => t.unread).length;
}
