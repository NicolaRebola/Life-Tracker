import { Inject, Injectable } from '@nestjs/common';
import {
  EVENT_REPOSITORY,
  EventValidationError,
  type EventRepositoryPort,
} from '../../domain';
import { isEventStatus } from '../../domain/entities/event-status';
import { EventNotFoundError } from '../errors/event-not-found.error';
import { UpdateEventStatusValidationError } from '../errors/update-event-status-validation.error';
import type {
  UpdateEventStatusCommand,
  UpdateEventStatusPort,
  UpdateEventStatusResult,
} from '../ports/inbound/update-event-status.port';

@Injectable()
export class UpdateEventStatusUseCase implements UpdateEventStatusPort {
  constructor(
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: EventRepositoryPort,
  ) {}

  async execute(
    command: UpdateEventStatusCommand,
  ): Promise<UpdateEventStatusResult> {
    if (!command.eventId?.trim()) {
      throw new UpdateEventStatusValidationError('Evento inválido', [
        'eventId',
      ]);
    }

    if (!isEventStatus(command.status)) {
      throw new UpdateEventStatusValidationError('Estado inválido', ['status']);
    }

    try {
      const updated = await this.eventRepository.updateStatus(
        command.userId,
        command.eventId,
        command.status,
      );

      if (!updated?.id) {
        throw new EventNotFoundError();
      }

      return {
        id: updated.id,
        status: updated.status,
      };
    } catch (error) {
      if (error instanceof EventValidationError) {
        throw new UpdateEventStatusValidationError(error.message, error.fields);
      }

      throw error;
    }
  }
}
