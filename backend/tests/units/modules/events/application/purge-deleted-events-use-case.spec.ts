import { PurgeDeletedEventsUseCase } from 'src/modules/events/application/use-cases/purge-deleted-events-use-case';
import type { EventRepositoryPort } from 'src/modules/events/domain';

describe('PurgeDeletedEventsUseCase', () => {
  let purgeDeletedBefore: jest.Mock;
  let repository: EventRepositoryPort;
  let useCase: PurgeDeletedEventsUseCase;
  const originalRetentionDays = process.env.EVENT_SOFT_DELETE_RETENTION_DAYS;

  beforeEach(() => {
    purgeDeletedBefore = jest.fn().mockResolvedValue(3);
    repository = {
      save: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      searchTagsByName: jest.fn(),
      findByIdForUser: jest.fn(),
      applyStatusTransition: jest.fn(),
      softDelete: jest.fn(),
      purgeDeletedBefore,
    };
    useCase = new PurgeDeletedEventsUseCase(repository);
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-06-08T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
    if (originalRetentionDays === undefined) {
      delete process.env.EVENT_SOFT_DELETE_RETENTION_DAYS;
    } else {
      process.env.EVENT_SOFT_DELETE_RETENTION_DAYS = originalRetentionDays;
    }
  });

  it('purges events deleted before the default 30-day cutoff', async () => {
    const result = await useCase.execute();

    expect(result).toEqual({ purgedCount: 3 });
    expect(purgeDeletedBefore).toHaveBeenCalledWith(
      new Date('2026-05-09T12:00:00.000Z'),
    );
  });

  it('uses EVENT_SOFT_DELETE_RETENTION_DAYS when configured', async () => {
    process.env.EVENT_SOFT_DELETE_RETENTION_DAYS = '7';

    await useCase.execute();

    expect(purgeDeletedBefore).toHaveBeenCalledWith(
      new Date('2026-06-01T12:00:00.000Z'),
    );
  });
});
