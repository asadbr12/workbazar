-- CreateIndex
CREATE INDEX "WorkerProfile_lat_lng_idx" ON "WorkerProfile"("lat", "lng");

-- CreateIndex
CREATE INDEX "WorkerProfile_skills_idx" ON "WorkerProfile" USING GIN ("skills");

-- CreateIndex
CREATE INDEX "Subscription_userId_status_idx" ON "Subscription"("userId", "status");
