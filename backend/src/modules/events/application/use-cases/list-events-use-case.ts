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
const CALENDAR_LIMIT = 500;

function parseOptionalIsoDate(value: string | undefined): Date | undefined {
  if (!value?.trim()) return undefined;

  const date = new Date(value.trim());
  if (Number.isNaN(date.getTime())) return undefined;

  return date;
}

@Injectable()
export class ListEventsUseCase implements ListEventsPort {
  constructor(
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: EventRepositoryPort,
  ) {}

  async execute(command: ListEventsCommand): Promise<ListEventsResult> {
    const rangeStart = parseOptionalIsoDate(command.fromDateTime);
    const rangeEnd = parseOptionalIsoDate(command.toDateTime);
    const hasRangeFilter = Boolean(command.fromDateTime || command.toDateTime);

    if (hasRangeFilter) {
      if (!rangeStart) {
        throw new ListEventsValidationError('Fecha inválida', ['fromDateTime']);
      }

      if (!rangeEnd) {
        throw new ListEventsValidationError('Fecha inválida', ['toDateTime']);
      }

      if (rangeStart >= rangeEnd) {
        throw new ListEventsValidationError('El rango de fechas es inválido', [
          'fromDateTime',
          'toDateTime',
        ]);
      }
    }

    const page = command.page ?? 1;
    const defaultLimit = hasRangeFilter ? CALENDAR_LIMIT : 10;
    const limit = command.limit ?? defaultLimit;

    if (!Number.isInteger(page) || page < 1) {
      throw new ListEventsValidationError('Página inválida', ['page']);
    }

    const allowedLimits: number[] = hasRangeFilter
      ? [...ALLOWED_LIMITS, CALENDAR_LIMIT]
      : [...ALLOWED_LIMITS];

    if (!allowedLimits.includes(limit)) {
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
      rangeStart,
      rangeEnd,
      page,
      limit,
    });

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      items: items.map(({ event, commentCount, participantCount, creator }) => {
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
          commentCount,
          participantCount,
          creator,
          isCreator: props.userId === command.userId,
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
