import { Inject, Injectable } from '@nestjs/common';
import {
  EVENT_REPOSITORY,
  EventStatusTransitionError,
  EventValidationError,
  type EventRepositoryPort,
  type EventStatusTransition,
} from '../../domain';
import { isEventStatus } from '../../domain/entities/event-status';
import { EventNotFoundError } from '../errors/event-not-found.error';
import { UpdateEventStatusConflictError } from '../errors/update-event-status-conflict.error';
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

    const event = await this.eventRepository.findByIdForUser(
      command.userId,
      command.eventId,
    );

    if (!event?.id) {
      throw new EventNotFoundError();
    }

    let transition: EventStatusTransition;

    try {
      ({ transition } = event.transitionTo(command.status));
    } catch (error) {
      if (error instanceof EventStatusTransitionError) {
        throw new UpdateEventStatusValidationError(error.message, error.fields);
      }

      if (error instanceof EventValidationError) {
        throw new UpdateEventStatusValidationError(error.message, error.fields);
      }

      throw error;
    }

    if (!transition.changed) {
      return {
        id: event.id,
        status: transition.toStatus,
      };
    }

    const { event: updatedEvent, applied } =
      await this.eventRepository.applyStatusTransition({
        userId: command.userId,
        eventId: command.eventId,
        fromStatus: transition.fromStatus,
        toStatus: transition.toStatus,
      });

    if (!updatedEvent.id) {
      throw new EventNotFoundError();
    }

    if (applied) {
      // Future: notify participants using `transition`.
      return {
        id: updatedEvent.id,
        status: updatedEvent.status,
      };
    }

    if (updatedEvent.status === transition.toStatus) {
      return {
        id: updatedEvent.id,
        status: updatedEvent.status,
      };
    }

    throw new UpdateEventStatusConflictError(
      'El evento cambió de estado concurrentemente',
      transition.fromStatus,
      updatedEvent.status,
      transition.toStatus,
    );
  }
}
