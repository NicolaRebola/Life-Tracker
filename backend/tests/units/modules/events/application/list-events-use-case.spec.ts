import { ListEventsUseCase } from 'src/modules/events/application/use-cases/list-events-use-case';
import { ListEventsValidationError } from 'src/modules/events/application/errors/list-events-validation.error';
import { Event } from 'src/modules/events/domain';
import type { EventRepositoryPort } from 'src/modules/events/domain';

describe('ListEventsUseCase', () => {
  let findMany: jest.Mock;
  let repository: EventRepositoryPort;
  let useCase: ListEventsUseCase;

  beforeEach(() => {
    findMany = jest.fn().mockResolvedValue({
      items: [
        {
          event: Event.rehydrate({
            id: 'event-1',
            userId: 'user-1',
            name: 'Evento',
            description: 'Descripcion',
            notes: '',
            fromDateTime: new Date('2026-06-05T08:29:00.000Z'),
            toDateTime: new Date('2026-06-05T09:29:00.000Z'),
            status: 'TODO',
            tags: [{ name: 'universidad', label: 'universidad' }],
          }),
          commentCount: 3,
          participantCount: 0,
          creator: {
            id: 'user-1',
            displayName: 'Test User',
            email: 'test@example.com',
          },
        },
      ],
      total: 1,
    });
    repository = {
      save: jest.fn(),
      update: jest.fn(),
      findMany,
      searchTagsByName: jest.fn(),
      findByIdForUser: jest.fn(),
      applyStatusTransition: jest.fn(),
      softDelete: jest.fn(),
      purgeDeletedBefore: jest.fn(),
    };
    useCase = new ListEventsUseCase(repository);
  });

  it('lists events for the authenticated user with pagination metadata', async () => {
    const result = await useCase.execute({
      userId: 'user-1',
      userEmail: 'test@example.com',
      page: 1,
      limit: 10,
    });

    expect(findMany).toHaveBeenCalledWith({
      userId: 'user-1',
      userEmail: 'test@example.com',
      name: undefined,
      status: undefined,
      tags: undefined,
      rangeStart: undefined,
      rangeEnd: undefined,
      page: 1,
      limit: 10,
    });
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      id: 'event-1',
      name: 'Evento',
      status: 'TODO',
      tags: [{ name: 'universidad', label: 'universidad' }],
      commentCount: 3,
      isCreator: true,
    });
    expect(result.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    });
  });

  it('normalizes filters before querying the repository', async () => {
    await useCase.execute({
      userId: 'user-1',
      userEmail: 'test@example.com',
      name: '  clase  ',
      status: 'IN_PROGRESS',
      tags: [' Eti ', ' queta 1 ', ''],
      page: 2,
      limit: 5,
    });

    expect(findMany).toHaveBeenCalledWith({
      userId: 'user-1',
      userEmail: 'test@example.com',
      name: 'clase',
      status: 'IN_PROGRESS',
      tags: ['eti', 'queta 1'],
      rangeStart: undefined,
      rangeEnd: undefined,
      page: 2,
      limit: 5,
    });
  });

  it('rejects invalid page values', async () => {
    await expect(
      useCase.execute({
        userId: 'user-1',
        userEmail: 'test@example.com',
        page: 0,
      }),
    ).rejects.toBeInstanceOf(ListEventsValidationError);

    expect(findMany).not.toHaveBeenCalled();
  });

  it('rejects unsupported page sizes', async () => {
    await expect(
      useCase.execute({
        userId: 'user-1',
        userEmail: 'test@example.com',
        limit: 15,
      }),
    ).rejects.toMatchObject<ListEventsValidationError>({
      fields: ['limit'],
    } as ListEventsValidationError);

    expect(findMany).not.toHaveBeenCalled();
  });

  it('rejects invalid status filters', async () => {
    await expect(
      useCase.execute({
        userId: 'user-1',
        userEmail: 'test@example.com',
        status: 'INVALID' as 'TODO',
      }),
    ).rejects.toMatchObject<ListEventsValidationError>({
      fields: ['status'],
    } as ListEventsValidationError);

    expect(findMany).not.toHaveBeenCalled();
  });

  it('passes normalized date range filters to the repository', async () => {
    await useCase.execute({
      userId: 'user-1',
      userEmail: 'test@example.com',
      fromDateTime: '2026-06-01T00:00:00.000Z',
      toDateTime: '2026-07-01T00:00:00.000Z',
    });

    expect(findMany).toHaveBeenCalledWith({
      userId: 'user-1',
      userEmail: 'test@example.com',
      name: undefined,
      status: undefined,
      tags: undefined,
      rangeStart: new Date('2026-06-01T00:00:00.000Z'),
      rangeEnd: new Date('2026-07-01T00:00:00.000Z'),
      page: 1,
      limit: 500,
    });
  });

  it('rejects invalid date range filters', async () => {
    await expect(
      useCase.execute({
        userId: 'user-1',
        userEmail: 'test@example.com',
        fromDateTime: 'invalid-date',
        toDateTime: '2026-07-01T00:00:00.000Z',
      }),
    ).rejects.toMatchObject<ListEventsValidationError>({
      fields: ['fromDateTime'],
    } as ListEventsValidationError);

    await expect(
      useCase.execute({
        userId: 'user-1',
        userEmail: 'test@example.com',
        fromDateTime: '2026-07-01T00:00:00.000Z',
        toDateTime: '2026-06-01T00:00:00.000Z',
      }),
    ).rejects.toMatchObject<ListEventsValidationError>({
      fields: ['fromDateTime', 'toDateTime'],
    } as ListEventsValidationError);

    expect(findMany).not.toHaveBeenCalled();
  });

  it('marks invited events with isCreator false', async () => {
    findMany.mockResolvedValueOnce({
      items: [
        {
          event: Event.rehydrate({
            id: 'event-2',
            userId: 'owner-1',
            name: 'Evento compartido',
            description: 'Descripcion',
            notes: '',
            fromDateTime: new Date('2026-06-05T08:29:00.000Z'),
            toDateTime: new Date('2026-06-05T09:29:00.000Z'),
            status: 'TODO',
            tags: [],
          }),
          commentCount: 0,
          participantCount: 2,
          creator: {
            id: 'owner-1',
            displayName: 'Owner User',
            email: 'owner@example.com',
          },
        },
      ],
      total: 1,
    });

    const result = await useCase.execute({
      userId: 'user-1',
      userEmail: 'guest@example.com',
      page: 1,
      limit: 10,
    });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        userEmail: 'guest@example.com',
      }),
    );
    expect(result.items[0]).toMatchObject({
      id: 'event-2',
      isCreator: false,
      creator: {
        id: 'owner-1',
        email: 'owner@example.com',
      },
    });
  });
});
