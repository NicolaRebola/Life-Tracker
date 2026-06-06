-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');

-- AlterTable
ALTER TABLE "events" ADD COLUMN "status" "EventStatus" NOT NULL DEFAULT 'TODO';

-- CreateIndex
CREATE INDEX "events_userId_status_idx" ON "events"("userId", "status");

-- CreateIndex
CREATE INDEX "events_userId_fromDateTime_idx" ON "events"("userId", "fromDateTime");
