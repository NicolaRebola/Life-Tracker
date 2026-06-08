import { PrismaEventCommentRepository } from './prisma/event-comment.repository';
import { PrismaEventInvitationRepository } from './prisma/event-invitation.repository';
import { PrismaEventParticipantRepository } from './prisma/event-participant.repository';
import { PrismaEventRepository } from './prisma/event.repository';
import { PrismaMessageOutboxRepository } from './prisma/message-outbox.repository';
import { PrismaParticipantSessionRepository } from './prisma/participant-session.repository';

export const REPOSITORIES = [
  PrismaEventCommentRepository,
  PrismaEventInvitationRepository,
  PrismaEventParticipantRepository,
  PrismaEventRepository,
  PrismaMessageOutboxRepository,
  PrismaParticipantSessionRepository,
];
