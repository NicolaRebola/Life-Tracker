-- AlterTable
ALTER TABLE "events" ADD COLUMN "deleted_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "events_deleted_at_idx" ON "events"("deleted_at");
