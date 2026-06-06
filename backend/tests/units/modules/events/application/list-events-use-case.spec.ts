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
        Event.rehydrate({
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
      ],
      total: 1,
    });
    repository = {
      save: jest.fn(),
      findMany,
      searchTagsByName: jest.fn(),
      findByIdForUser: jest.fn(),
      applyStatusTransition: jest.fn(),
    };
    useCase = new ListEventsUseCase(repository);
  });

  it('lists events for the authenticated user with pagination metadata', async () => {
    const result = await useCase.execute({
      userId: 'user-1',
      page: 1,
      limit: 10,
    });

    expect(findMany).toHaveBeenCalledWith({
      userId: 'user-1',
      name: undefined,
      status: undefined,
      tags: undefined,
      page: 1,
      limit: 10,
    });
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      id: 'event-1',
      name: 'Evento',
      status: 'TODO',
      tags: [{ name: 'universidad', label: 'universidad' }],
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
      name: '  clase  ',
      status: 'IN_PROGRESS',
      tags: [' Eti ', ' queta 1 ', ''],
      page: 2,
      limit: 5,
    });

    expect(findMany).toHaveBeenCalledWith({
      userId: 'user-1',
      name: 'clase',
      status: 'IN_PROGRESS',
      tags: ['eti', 'queta 1'],
      page: 2,
      limit: 5,
    });
  });

  it('rejects invalid page values', async () => {
    await expect(
      useCase.execute({
        userId: 'user-1',
        page: 0,
      }),
    ).rejects.toBeInstanceOf(ListEventsValidationError);

    expect(findMany).not.toHaveBeenCalled();
  });

  it('rejects unsupported page sizes', async () => {
    await expect(
      useCase.execute({
        userId: 'user-1',
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
        status: 'INVALID' as 'TODO',
      }),
    ).rejects.toMatchObject<ListEventsValidationError>({
      fields: ['status'],
    } as ListEventsValidationError);

    expect(findMany).not.toHaveBeenCalled();
  });
});
