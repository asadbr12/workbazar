-- AlterTable
ALTER TABLE "RecruiterProfile" ADD COLUMN     "pincode" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "serviceAreas" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "workerTypesNeeded" SET DEFAULT ARRAY[]::TEXT[];
