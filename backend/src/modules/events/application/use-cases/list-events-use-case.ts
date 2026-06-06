import { Inject, Injectable } from '@nestjs/common';
import { EVENT_REPOSITORY, type EventRepositoryPort } from '../../domain';
import { isEventStatus } from '../../domain/entities/event-status';
import { ListEventsValidationError } from '../errors/list-events-validation.error';
import type {
  ListEventsCommand,
  ListEventsPort,
  ListEventsResult,
} from '../ports/inbound/list-events.port';

const ALLOWED_LIMITS = [5, 10, 20, 50] as const;

@Injectable()
export class ListEventsUseCase implements ListEventsPort {
  constructor(
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: EventRepositoryPort,
  ) {}

  async execute(command: ListEventsCommand): Promise<ListEventsResult> {
    const page = command.page ?? 1;
    const limit = command.limit ?? 10;

    if (!Number.isInteger(page) || page < 1) {
      throw new ListEventsValidationError('Página inválida', ['page']);
    }

    if (!ALLOWED_LIMITS.includes(limit as (typeof ALLOWED_LIMITS)[number])) {
      throw new ListEventsValidationError('Límite inválido', ['limit']);
    }

    if (command.status && !isEventStatus(command.status)) {
      throw new ListEventsValidationError('Estado inválido', ['status']);
    }

    const name = command.name?.trim();
    const tags = command.tags
      ?.map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);

    const { items, total } = await this.eventRepository.findMany({
      userId: command.userId,
      name: name || undefined,
      status: command.status,
      tags: tags?.length ? tags : undefined,
      page,
      limit,
    });

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      items: items.map((event) => {
        const props = event.toPrimitives();
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
      }),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }
}
