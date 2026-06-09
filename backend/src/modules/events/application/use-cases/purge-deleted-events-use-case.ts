import { Inject, Injectable } from '@nestjs/common';
import { EVENT_REPOSITORY, type EventRepositoryPort } from '../../domain';
import type {
  PurgeDeletedEventsPort,
  PurgeDeletedEventsResult,
} from '../ports/inbound/purge-deleted-events.port';

const DEFAULT_RETENTION_DAYS = 30;

@Injectable()
export class PurgeDeletedEventsUseCase implements PurgeDeletedEventsPort {
  constructor(
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: EventRepositoryPort,
  ) {}

  async execute(): Promise<PurgeDeletedEventsResult> {
    const retentionDays = Number(
      process.env.EVENT_SOFT_DELETE_RETENTION_DAYS ?? DEFAULT_RETENTION_DAYS,
    );
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retentionDays);

    const purgedCount = await this.eventRepository.purgeDeletedBefore(cutoff);

    return { purgedCount };
  }
}
