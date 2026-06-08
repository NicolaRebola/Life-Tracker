import { Inject, Injectable } from '@nestjs/common';
import { EVENT_REPOSITORY, type EventRepositoryPort } from '../../domain';
import { EventNotFoundError } from '../errors/event-not-found.error';
import type {
  GetSharedEventCommand,
  GetSharedEventPort,
  SharedEventResult,
} from '../ports/inbound/get-shared-event.port';

@Injectable()
export class GetSharedEventUseCase implements GetSharedEventPort {
  constructor(
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: EventRepositoryPort,
  ) {}

  async execute(command: GetSharedEventCommand): Promise<SharedEventResult> {
    const event = await this.eventRepository.findByIdForParticipant(
      command.participantId,
      command.eventId,
    );

    if (!event?.id) {
      throw new EventNotFoundError();
    }

    const props = event.toPrimitives();

    return {
      event: {
        id: props.id!,
        name: props.name,
        description: props.description,
        notes: props.notes,
        fromDateTime: props.fromDateTime.toISOString(),
        toDateTime: props.toDateTime.toISOString(),
        status: props.status,
        tags: props.tags,
      },
    };
  }
}
