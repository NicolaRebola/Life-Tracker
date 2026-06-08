-- CreateEnum
CREATE TYPE "EventInvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "EventInvitationChannel" AS ENUM ('EMAIL');

-- CreateEnum
CREATE TYPE "MessageOutboxStatus" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "MessageFailureKind" AS ENUM ('TRANSIENT', 'PERMANENT');

-- CreateTable
CREATE TABLE "event_participants" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "display_name" TEXT,
    "user_id" TEXT,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "event_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_invitations" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "invited_email" TEXT NOT NULL,
    "invited_by_user_id" TEXT NOT NULL,
    "channel" "EventInvitationChannel" NOT NULL,
    "status" "EventInvitationStatus" NOT NULL DEFAULT 'PENDING',
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "delivery_failed_at" TIMESTAMP(3),
    "last_delivery_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participant_sessions" (
    "id" TEXT NOT NULL,
    "participant_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "participant_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_outbox" (
    "id" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "message_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "MessageOutboxStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 3,
    "failure_kind" "MessageFailureKind",
    "provider_message_id" TEXT,
    "last_error_code" TEXT,
    "last_error" TEXT,
    "available_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_outbox_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "event_comments" ALTER COLUMN "user_id" DROP NOT NULL;
ALTER TABLE "event_comments" ADD COLUMN "participant_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "event_participants_event_id_email_key" ON "event_participants"("event_id", "email");

-- CreateIndex
CREATE INDEX "event_participants_email_idx" ON "event_participants"("email");

-- CreateIndex
CREATE INDEX "event_participants_user_id_idx" ON "event_participants"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_invitations_token_hash_key" ON "event_invitations"("token_hash");

-- CreateIndex
CREATE INDEX "event_invitations_event_id_invited_email_status_idx" ON "event_invitations"("event_id", "invited_email", "status");

-- CreateIndex
CREATE INDEX "event_invitations_expires_at_idx" ON "event_invitations"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "participant_sessions_token_hash_key" ON "participant_sessions"("token_hash");

-- CreateIndex
CREATE INDEX "participant_sessions_participant_id_idx" ON "participant_sessions"("participant_id");

-- CreateIndex
CREATE INDEX "participant_sessions_expires_at_idx" ON "participant_sessions"("expires_at");

-- CreateIndex
CREATE INDEX "message_outbox_status_available_at_idx" ON "message_outbox"("status", "available_at");

-- CreateIndex
CREATE INDEX "event_comments_participant_id_idx" ON "event_comments"("participant_id");

-- AddForeignKey
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_invitations" ADD CONSTRAINT "event_invitations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_invitations" ADD CONSTRAINT "event_invitations_invited_by_user_id_fkey" FOREIGN KEY ("invited_by_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participant_sessions" ADD CONSTRAINT "participant_sessions_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "event_participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_comments" ADD CONSTRAINT "event_comments_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "event_participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
