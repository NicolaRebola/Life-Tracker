import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { EventInvitationController } from './delivery/event-invitation.controller';
import { EventController } from './delivery/event.controller';
import { OutboxDispatchController } from './delivery/outbox-dispatch.controller';
import { SharedEventController } from './delivery/shared-event.controller';
import { USE_CASES } from './application';
import { REPOSITORIES } from './infrastructure/repositories';
import { SessionModule } from '../session/session.module';
import {
  EVENT_COMMENT_REPOSITORY,
  EVENT_INVITATION_REPOSITORY,
  EVENT_PARTICIPANT_REPOSITORY,
  EVENT_REPOSITORY,
  MESSAGE_OUTBOX_REPOSITORY,
  PARTICIPANT_SESSION_REPOSITORY,
} from './domain';
import { PrismaEventCommentRepository } from './infrastructure/repositories/prisma/event-comment.repository';
import { PrismaEventInvitationRepository } from './infrastructure/repositories/prisma/event-invitation.repository';
import { PrismaEventParticipantRepository } from './infrastructure/repositories/prisma/event-participant.repository';
import { PrismaEventRepository } from './infrastructure/repositories/prisma/event.repository';
import { PrismaMessageOutboxRepository } from './infrastructure/repositories/prisma/message-outbox.repository';
import { PrismaParticipantSessionRepository } from './infrastructure/repositories/prisma/participant-session.repository';
import { EmailDevMessageAdapter } from './infrastructure/messaging/email-dev-message.adapter';
import { EmailInvitationStrategy } from './infrastructure/messaging/email-invitation.strategy';
import { ResendMessageAdapter } from './infrastructure/messaging/resend-message.adapter';
import { InternalJobGuard } from './application/internal-job.guard';
import { ParticipantSessionGuard } from './application/participant-session.guard';
import { ACCEPT_EVENT_INVITATION } from './application/ports/inbound/accept-event-invitation.port';
import { CREATE_EVENT_COMMENT } from './application/ports/inbound/create-event-comment.port';
import { CREATE_EVENT } from './application/ports/inbound/create-event.port';
import { DELETE_EVENT_COMMENT } from './application/ports/inbound/delete-event-comment.port';
import { DELETE_EVENT } from './application/ports/inbound/delete-event.port';
import { DISPATCH_OUTBOX_MESSAGES } from './application/ports/inbound/dispatch-outbox-messages.port';
import { GET_EVENT_INVITATION } from './application/ports/inbound/get-event-invitation.port';
import { GET_SHARED_EVENT } from './application/ports/inbound/get-shared-event.port';
import { INVITE_EVENT_PARTICIPANT } from './application/ports/inbound/invite-event-participant.port';
import { LIST_EVENT_COMMENTS } from './application/ports/inbound/list-event-comments.port';
import { LIST_EVENT_PARTICIPANTS } from './application/ports/inbound/list-event-participants.port';
import { LIST_EVENTS } from './application/ports/inbound/list-events.port';
import { PURGE_DELETED_EVENTS } from './application/ports/inbound/purge-deleted-events.port';
import { REMOVE_EVENT_PARTICIPANT } from './application/ports/inbound/remove-event-participant.port';
import { SEARCH_EVENT_TAGS } from './application/ports/inbound/search-event-tags.port';
import { UPDATE_EVENT_COMMENT } from './application/ports/inbound/update-event-comment.port';
import { UPDATE_EVENT_STATUS } from './application/ports/inbound/update-event-status.port';
import { UPDATE_EVENT } from './application/ports/inbound/update-event.port';
import { INVITATION_CHANNEL_STRATEGY } from './application/ports/outbound/invitation-channel-strategy.port';
import { MESSAGE_CHANNEL_ADAPTER } from './application/ports/outbound/message-channel-adapter.port';
import { AcceptEventInvitationUseCase } from './application/use-cases/accept-event-invitation-use-case';
import { CreateEventCommentUseCase } from './application/use-cases/create-event-comment-use-case';
import { CreateEventUseCase } from './application/use-cases/create-event-use-case';
import { DeleteEventCommentUseCase } from './application/use-cases/delete-event-comment-use-case';
import { DeleteEventUseCase } from './application/use-cases/delete-event-use-case';
import { DispatchOutboxMessagesUseCase } from './application/use-cases/dispatch-outbox-messages-use-case';
import { GetEventInvitationUseCase } from './application/use-cases/get-event-invitation-use-case';
import { GetSharedEventUseCase } from './application/use-cases/get-shared-event-use-case';
import { InviteEventParticipantUseCase } from './application/use-cases/invite-event-participant-use-case';
import { ListEventCommentsUseCase } from './application/use-cases/list-event-comments-use-case';
import { ListEventParticipantsUseCase } from './application/use-cases/list-event-participants-use-case';
import { ListEventsUseCase } from './application/use-cases/list-events-use-case';
import { PurgeDeletedEventsUseCase } from './application/use-cases/purge-deleted-events-use-case';
import { RemoveEventParticipantUseCase } from './application/use-cases/remove-event-participant-use-case';
import { SearchEventTagsUseCase } from './application/use-cases/search-event-tags-use-case';
import { UpdateEventCommentUseCase } from './application/use-cases/update-event-comment-use-case';
import { UpdateEventStatusUseCase } from './application/use-cases/update-event-status-use-case';
import { UpdateEventUseCase } from './application/use-cases/update-event-use-case';

@Module({
  imports: [PrismaModule, SessionModule],
  controllers: [
    EventController,
    EventInvitationController,
    OutboxDispatchController,
    SharedEventController,
  ],
  providers: [
    ...USE_CASES,
    ...REPOSITORIES,
    EmailDevMessageAdapter,
    EmailInvitationStrategy,
    ResendMessageAdapter,
    InternalJobGuard,
    ParticipantSessionGuard,
    {
      provide: ACCEPT_EVENT_INVITATION,
      useExisting: AcceptEventInvitationUseCase,
    },
    { provide: CREATE_EVENT, useExisting: CreateEventUseCase },
    { provide: CREATE_EVENT_COMMENT, useExisting: CreateEventCommentUseCase },
    { provide: DELETE_EVENT, useExisting: DeleteEventUseCase },
    { provide: DELETE_EVENT_COMMENT, useExisting: DeleteEventCommentUseCase },
    {
      provide: DISPATCH_OUTBOX_MESSAGES,
      useExisting: DispatchOutboxMessagesUseCase,
    },
    { provide: GET_EVENT_INVITATION, useExisting: GetEventInvitationUseCase },
    { provide: GET_SHARED_EVENT, useExisting: GetSharedEventUseCase },
    {
      provide: INVITE_EVENT_PARTICIPANT,
      useExisting: InviteEventParticipantUseCase,
    },
    { provide: LIST_EVENTS, useExisting: ListEventsUseCase },
    { provide: LIST_EVENT_COMMENTS, useExisting: ListEventCommentsUseCase },
    {
      provide: LIST_EVENT_PARTICIPANTS,
      useExisting: ListEventParticipantsUseCase,
    },
    { provide: PURGE_DELETED_EVENTS, useExisting: PurgeDeletedEventsUseCase },
    {
      provide: REMOVE_EVENT_PARTICIPANT,
      useExisting: RemoveEventParticipantUseCase,
    },
    { provide: SEARCH_EVENT_TAGS, useExisting: SearchEventTagsUseCase },
    { provide: UPDATE_EVENT_COMMENT, useExisting: UpdateEventCommentUseCase },
    { provide: UPDATE_EVENT_STATUS, useExisting: UpdateEventStatusUseCase },
    { provide: UPDATE_EVENT, useExisting: UpdateEventUseCase },
    {
      provide: INVITATION_CHANNEL_STRATEGY,
      useExisting: EmailInvitationStrategy,
    },
    {
      provide: MESSAGE_CHANNEL_ADAPTER,
      useFactory: (
        resendAdapter: ResendMessageAdapter,
        devAdapter: EmailDevMessageAdapter,
      ) => (process.env.RESEND_API_KEY ? resendAdapter : devAdapter),
      inject: [ResendMessageAdapter, EmailDevMessageAdapter],
    },
    { provide: EVENT_REPOSITORY, useExisting: PrismaEventRepository },
    {
      provide: EVENT_COMMENT_REPOSITORY,
      useExisting: PrismaEventCommentRepository,
    },
    {
      provide: EVENT_INVITATION_REPOSITORY,
      useExisting: PrismaEventInvitationRepository,
    },
    {
      provide: EVENT_PARTICIPANT_REPOSITORY,
      useExisting: PrismaEventParticipantRepository,
    },
    {
      provide: MESSAGE_OUTBOX_REPOSITORY,
      useExisting: PrismaMessageOutboxRepository,
    },
    {
      provide: PARTICIPANT_SESSION_REPOSITORY,
      useExisting: PrismaParticipantSessionRepository,
    },
  ],
})
export class EventModule {}
