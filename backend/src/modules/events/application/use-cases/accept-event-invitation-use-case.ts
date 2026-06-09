import { Inject, Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import {
  EVENT_INVITATION_REPOSITORY,
  EventInvitation,
  EventInvitationValidationError,
  PARTICIPANT_SESSION_REPOSITORY,
  type EventInvitationRepositoryPort,
  type ParticipantSessionRepositoryPort,
} from '../../domain';
import { EventInvitationExpiredError } from '../errors/event-invitation-expired.error';
import { EventInvitationNotFoundError } from '../errors/event-invitation-not-found.error';
import type {
  AcceptEventInvitationCommand,
  AcceptEventInvitationPort,
  AcceptEventInvitationResult,
} from '../ports/inbound/accept-event-invitation.port';

const PARTICIPANT_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

@Injectable()
export class AcceptEventInvitationUseCase implements AcceptEventInvitationPort {
  constructor(
    @Inject(EVENT_INVITATION_REPOSITORY)
    private readonly invitationRepository: EventInvitationRepositoryPort,
    @Inject(PARTICIPANT_SESSION_REPOSITORY)
    private readonly participantSessionRepository: ParticipantSessionRepositoryPort,
  ) {}

  async execute(
    command: AcceptEventInvitationCommand,
  ): Promise<AcceptEventInvitationResult> {
    if (!command.token?.trim()) {
      throw new EventInvitationNotFoundError();
    }

    const tokenHash = createHash('sha256')
      .update(command.token.trim())
      .digest('hex');
    const invitation =
      await this.invitationRepository.findByTokenHash(tokenHash);

    if (!invitation?.id) {
      throw new EventInvitationNotFoundError();
    }

    const now = new Date();
    let acceptedInvitation: EventInvitation;

    try {
      acceptedInvitation = invitation.accept(now);
    } catch (error) {
      if (
        error instanceof EventInvitationValidationError &&
        invitation.expiresAt <= now
      ) {
        await this.invitationRepository.save(invitation.expire(now));
        throw new EventInvitationExpiredError();
      }

      throw new EventInvitationNotFoundError();
    }

    const { participant } =
      await this.invitationRepository.acceptWithParticipant({
        invitation: acceptedInvitation,
        participantDisplayName: command.displayName,
      });

    const participantSessionToken = randomBytes(32).toString('base64url');
    const participantSessionTokenHash = createHash('sha256')
      .update(participantSessionToken)
      .digest('hex');
    const expiresAt = new Date(now.getTime() + PARTICIPANT_SESSION_TTL_MS);

    await this.participantSessionRepository.create({
      participantId: participant.id,
      tokenHash: participantSessionTokenHash,
      expiresAt,
    });

    return {
      participantSessionToken,
      expiresAt: expiresAt.toISOString(),
      participant,
    };
  }
}
