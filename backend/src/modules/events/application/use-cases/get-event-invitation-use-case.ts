import { Inject, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import {
  EVENT_INVITATION_REPOSITORY,
  EventInvitation,
  EventInvitationValidationError,
  type EventInvitationRepositoryPort,
} from '../../domain';
import {
  USER_REPOSITORY,
  type UserRepositoryPort,
} from 'src/modules/session/domain';
import { EventInvitationExpiredError } from '../errors/event-invitation-expired.error';
import { EventInvitationNotFoundError } from '../errors/event-invitation-not-found.error';
import type {
  GetEventInvitationCommand,
  GetEventInvitationPort,
  GetEventInvitationResult,
} from '../ports/inbound/get-event-invitation.port';

@Injectable()
export class GetEventInvitationUseCase implements GetEventInvitationPort {
  constructor(
    @Inject(EVENT_INVITATION_REPOSITORY)
    private readonly invitationRepository: EventInvitationRepositoryPort,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(
    command: GetEventInvitationCommand,
  ): Promise<GetEventInvitationResult> {
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
    const activeInvitation = await this.ensureActiveInvitation(invitation, now);
    const invitedUser = await this.userRepository.findByEmail(
      activeInvitation.invitedEmail,
    );

    return {
      invitation: {
        eventId: activeInvitation.eventId,
        status: activeInvitation.status,
        expiresAt: activeInvitation.expiresAt.toISOString(),
        invitedUserExists: Boolean(invitedUser),
      },
    };
  }

  private async ensureActiveInvitation(
    invitation: EventInvitation,
    now: Date,
  ): Promise<EventInvitation> {
    try {
      invitation.accept(now);
      return invitation;
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
  }
}
