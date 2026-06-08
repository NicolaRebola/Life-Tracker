import { Inject, Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import {
  EVENT_INVITATION_REPOSITORY,
  EVENT_REPOSITORY,
  EventInvitation,
  EventInvitationValidationError,
  MESSAGE_OUTBOX_REPOSITORY,
  type EventInvitationRepositoryPort,
  type EventRepositoryPort,
  type MessageOutboxRepositoryPort,
} from '../../domain';
import { EventNotFoundError } from '../errors/event-not-found.error';
import { InviteEventParticipantValidationError } from '../errors/invite-event-participant-validation.error';
import {
  INVITATION_CHANNEL_STRATEGY,
  type InvitationChannelStrategy,
} from '../ports/outbound/invitation-channel-strategy.port';
import type {
  InviteEventParticipantCommand,
  InviteEventParticipantPort,
  InviteEventParticipantResult,
} from '../ports/inbound/invite-event-participant.port';

const INVITATION_TTL_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class InviteEventParticipantUseCase implements InviteEventParticipantPort {
  constructor(
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: EventRepositoryPort,
    @Inject(EVENT_INVITATION_REPOSITORY)
    private readonly invitationRepository: EventInvitationRepositoryPort,
    @Inject(MESSAGE_OUTBOX_REPOSITORY)
    private readonly outboxRepository: MessageOutboxRepositoryPort,
    @Inject(INVITATION_CHANNEL_STRATEGY)
    private readonly invitationStrategy: InvitationChannelStrategy,
  ) {}

  async execute(
    command: InviteEventParticipantCommand,
  ): Promise<InviteEventParticipantResult> {
    if (!command.eventId?.trim()) {
      throw new InviteEventParticipantValidationError('Evento inválido', [
        'eventId',
      ]);
    }

    const event = await this.eventRepository.findByIdForOwner(
      command.userId,
      command.eventId,
    );

    if (!event?.id) {
      throw new EventNotFoundError();
    }

    const now = new Date();
    const invitedEmail = EventInvitation.normalizeEmail(command.email);
    await this.invitationRepository.expirePendingForEmail(
      command.eventId,
      invitedEmail,
      now,
    );

    const token = randomBytes(32).toString('base64url');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(now.getTime() + INVITATION_TTL_MS);

    let invitation: EventInvitation;
    try {
      invitation = EventInvitation.create({
        eventId: command.eventId,
        invitedEmail,
        invitedByUserId: command.userId,
        channel: 'EMAIL',
        tokenHash,
        expiresAt,
      });
    } catch (error) {
      if (error instanceof EventInvitationValidationError) {
        throw new InviteEventParticipantValidationError(
          error.message,
          error.fields,
        );
      }

      throw error;
    }

    const savedInvitation = await this.invitationRepository.save(invitation);
    const props = savedInvitation.toPrimitives();
    const eventProps = event.toPrimitives();
    const appBaseUrl = process.env.APP_BASE_URL ?? 'http://localhost:3000';
    const message = this.invitationStrategy.createMessage({
      channel: 'EMAIL',
      to: invitedEmail,
      eventId: command.eventId,
      eventName: eventProps.name,
      invitedByName: 'Life Tracker',
      invitationUrl: `${appBaseUrl}/event-invitations/${token}`,
      expiresAt,
    });

    await this.outboxRepository.enqueue({
      channel: message.channel,
      messageType: message.messageType,
      payload: {
        ...message.payload,
        invitationId: props.id,
      },
      maxAttempts: 3,
    });

    return {
      invitation: {
        id: props.id!,
        eventId: props.eventId,
        invitedEmail: props.invitedEmail,
        channel: props.channel,
        status: 'PENDING',
        expiresAt: props.expiresAt.toISOString(),
      },
    };
  }
}
