import { Inject, Injectable } from '@nestjs/common';
import { EVENT_REPOSITORY, type EventRepositoryPort } from '../../domain';
import { DeleteEventValidationError } from '../errors/delete-event-validation.error';
import { EventNotFoundError } from '../errors/event-not-found.error';
import type {
  DeleteEventCommand,
  DeleteEventPort,
} from '../ports/inbound/delete-event.port';

@Injectable()
export class DeleteEventUseCase implements DeleteEventPort {
  constructor(
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: EventRepositoryPort,
  ) {}

  async execute(command: DeleteEventCommand): Promise<void> {
    if (!command.eventId?.trim()) {
      throw new DeleteEventValidationError('Evento inválido', ['eventId']);
    }

    const deleted = await this.eventRepository.softDelete(
      command.userId,
      command.eventId,
      new Date(),
    );

    if (!deleted) {
      throw new EventNotFoundError();
    }
  }
}
