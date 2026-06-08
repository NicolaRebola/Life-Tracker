import { Inject, Injectable } from '@nestjs/common';
import {
  EVENT_PARTICIPANT_REPOSITORY,
  type EventParticipantRepositoryPort,
} from '../../domain';
import { EventParticipantNotFoundError } from '../errors/event-participant-not-found.error';
import type {
  RemoveEventParticipantCommand,
  RemoveEventParticipantPort,
} from '../ports/inbound/remove-event-participant.port';

@Injectable()
export class RemoveEventParticipantUseCase implements RemoveEventParticipantPort {
  constructor(
    @Inject(EVENT_PARTICIPANT_REPOSITORY)
    private readonly participantRepository: EventParticipantRepositoryPort,
  ) {}

  async execute(command: RemoveEventParticipantCommand): Promise<void> {
    if (!command.participantId?.trim()) {
      throw new EventParticipantNotFoundError();
    }

    const removed = await this.participantRepository.softRevoke(
      command.userId,
      command.eventId,
      command.participantId,
      new Date(),
    );

    if (!removed) {
      throw new EventParticipantNotFoundError();
    }
  }
}
