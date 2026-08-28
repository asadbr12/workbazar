-- AlterTable
ALTER TABLE "RecruiterProfile" ADD COLUMN     "photoUrl" TEXT;

-- AlterTable
ALTER TABLE "WorkerProfile" ADD COLUMN     "feePerHour" INTEGER,
ADD COLUMN     "photoUrl" TEXT;
