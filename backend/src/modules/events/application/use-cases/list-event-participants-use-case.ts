import { Inject, Injectable } from '@nestjs/common';
import {
  EVENT_INVITATION_REPOSITORY,
  EVENT_PARTICIPANT_REPOSITORY,
  EVENT_REPOSITORY,
  type EventInvitationRepositoryPort,
  type EventParticipantRepositoryPort,
  type EventRepositoryPort,
} from '../../domain';
import { EventNotFoundError } from '../errors/event-not-found.error';
import type {
  EventParticipantResponseItem,
  ListEventParticipantsCommand,
  ListEventParticipantsPort,
  ListEventParticipantsResult,
} from '../ports/inbound/list-event-participants.port';

@Injectable()
export class ListEventParticipantsUseCase implements ListEventParticipantsPort {
  constructor(
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: EventRepositoryPort,
    @Inject(EVENT_PARTICIPANT_REPOSITORY)
    private readonly participantRepository: EventParticipantRepositoryPort,
    @Inject(EVENT_INVITATION_REPOSITORY)
    private readonly invitationRepository: EventInvitationRepositoryPort,
  ) {}

  async execute(
    command: ListEventParticipantsCommand,
  ): Promise<ListEventParticipantsResult> {
    const event = await this.eventRepository.findByIdForOwner(
      command.userId,
      command.eventId,
    );

    if (!event) {
      throw new EventNotFoundError();
    }

    const [participants, invitations] = await Promise.all([
      this.participantRepository.listByEventForOwner(
        command.userId,
        command.eventId,
      ),
      this.invitationRepository.listByEventForOwner(
        command.userId,
        command.eventId,
      ),
    ]);

    const acceptedEmails = new Set(
      participants
        .filter((participant) => !participant.revokedAt)
        .map((participant) => participant.email),
    );

    const acceptedItems: EventParticipantResponseItem[] = participants.map(
      (participant) => ({
        id: participant.id,
        email: participant.email,
        displayName: participant.displayName,
        status: participant.revokedAt ? 'REVOKED' : 'ACCEPTED',
        joinedAt: participant.joinedAt.toISOString(),
      }),
    );

    const pendingItems: EventParticipantResponseItem[] = invitations
      .filter((invitation) => !acceptedEmails.has(invitation.invitedEmail))
      .map((invitation) => ({
        id: invitation.id,
        email: invitation.invitedEmail,
        displayName: null,
        status: invitation.status,
        invitedAt: invitation.createdAt.toISOString(),
        expiresAt: invitation.expiresAt.toISOString(),
        deliveryFailedAt: invitation.deliveryFailedAt?.toISOString(),
        lastDeliveryError: invitation.lastDeliveryError,
      }));

    return {
      items: [...acceptedItems, ...pendingItems],
    };
  }
}
