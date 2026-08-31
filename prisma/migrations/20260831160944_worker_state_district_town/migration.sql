-- AlterTable
ALTER TABLE "WorkerProfile" ADD COLUMN     "district" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "town" TEXT;

-- CreateIndex
CREATE INDEX "WorkerProfile_district_idx" ON "WorkerProfile"("district");
