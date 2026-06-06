import { Inject, Injectable } from '@nestjs/common';
import {
  EVENT_REPOSITORY,
  Event,
  EventValidationError,
  Tag,
} from '../../domain';
import type { EventRepositoryPort } from '../../domain';
import type {
  CreateEventCommand,
  CreateEventPort,
  CreateEventResult,
} from '../ports/inbound/create-event.port';
import { CreateEventValidationError } from '../errors/create-event-validation.error';

@Injectable()
export class CreateEventUseCase implements CreateEventPort {
  constructor(
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: EventRepositoryPort,
  ) {}

  async execute(command: CreateEventCommand): Promise<CreateEventResult> {
    const event = this.createDomainEvent(command);

    const savedEvent = await this.eventRepository.save(event);
    if (!savedEvent.id) {
      throw new Error('Event repository returned an event without id');
    }

    return { id: savedEvent.id };
  }

  private createDomainEvent(command: CreateEventCommand): Event {
    try {
      return Event.create({
        userId: command.userId,
        name: command.name,
        description: command.description,
        notes: command.notes,
        fromDateTime: new Date(command.fromDateTime),
        toDateTime: new Date(command.toDateTime),
        tags: Tag.uniqueFromLabels(command.tags),
      });
    } catch (error) {
      if (error instanceof EventValidationError) {
        throw new CreateEventValidationError(error.message, error.fields);
      }

      throw error;
    }
  }
}
