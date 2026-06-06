import { Inject, Injectable } from '@nestjs/common';
import { EVENT_REPOSITORY, type EventRepositoryPort } from '../../domain';
import { ListEventsValidationError } from '../errors/list-events-validation.error';
import type {
  SearchEventTagsCommand,
  SearchEventTagsPort,
  SearchEventTagsResult,
} from '../ports/inbound/search-event-tags.port';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 20;

@Injectable()
export class SearchEventTagsUseCase implements SearchEventTagsPort {
  constructor(
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: EventRepositoryPort,
  ) {}

  async execute(
    command: SearchEventTagsCommand,
  ): Promise<SearchEventTagsResult> {
    const name = command.name?.trim().toLowerCase() ?? '';
    const limit = command.limit ?? DEFAULT_LIMIT;

    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
      throw new ListEventsValidationError('Límite inválido', ['limit']);
    }

    if (!name) {
      return { items: [] };
    }

    const items = await this.eventRepository.searchTagsByName(
      command.userId,
      name,
      limit,
    );

    return { items };
  }
}
