import { Inject, Injectable } from '@nestjs/common';
import {
  EVENT_REPOSITORY,
  Event,
  EventValidationError,
  Tag,
  type EventRepositoryPort,
} from '../../domain';
import { EventNotFoundError } from '../errors/event-not-found.error';
import { UpdateEventValidationError } from '../errors/update-event-validation.error';
import type {
  UpdateEventCommand,
  UpdateEventPort,
  UpdateEventResult,
} from '../ports/inbound/update-event.port';

@Injectable()
export class UpdateEventUseCase implements UpdateEventPort {
  constructor(
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: EventRepositoryPort,
  ) {}

  async execute(command: UpdateEventCommand): Promise<UpdateEventResult> {
    if (!command.eventId?.trim()) {
      throw new UpdateEventValidationError('Evento inválido', ['eventId']);
    }

    const existingEvent = await this.eventRepository.findByIdForUser(
      command.userId,
      command.eventId,
    );

    if (!existingEvent?.id) {
      throw new EventNotFoundError();
    }

    let updatedEvent: Event;

    try {
      updatedEvent = existingEvent.updateDetails({
        name: command.name,
        description: command.description,
        notes: command.notes,
        fromDateTime: new Date(command.fromDateTime),
        toDateTime: new Date(command.toDateTime),
        tags: Tag.uniqueFromLabels(command.tags),
      });
    } catch (error) {
      if (error instanceof EventValidationError) {
        throw new UpdateEventValidationError(error.message, error.fields);
      }

      throw error;
    }

    const savedEvent = await this.eventRepository.update(updatedEvent);

    if (!savedEvent.id) {
      throw new EventNotFoundError();
    }

    const props = savedEvent.toPrimitives();

    return {
      id: props.id!,
      name: props.name,
      description: props.description,
      notes: props.notes,
      fromDateTime: props.fromDateTime.toISOString(),
      toDateTime: props.toDateTime.toISOString(),
      status: props.status,
      tags: props.tags,
    };
  }
}
