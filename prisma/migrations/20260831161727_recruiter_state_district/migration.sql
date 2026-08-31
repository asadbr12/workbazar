-- AlterTable
ALTER TABLE "RecruiterProfile" ADD COLUMN     "district" TEXT,
ADD COLUMN     "state" TEXT;

-- CreateIndex
CREATE INDEX "RecruiterProfile_district_idx" ON "RecruiterProfile"("district");
