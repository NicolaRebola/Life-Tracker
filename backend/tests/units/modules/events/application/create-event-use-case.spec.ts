import { CreateEventValidationError } from 'src/modules/events/application/errors/create-event.errors';
import { CreateEventUseCase } from 'src/modules/events/application/use-cases/create-event-use-case';
import type {
  EventRepositoryPort,
  EventToCreate,
  TagToCreate,
} from 'src/modules/events/application/ports/outbound/event-repository.port';

describe('CreateEventUseCase', () => {
  let createWithTags: jest.Mock;
  let repository: EventRepositoryPort;
  let useCase: CreateEventUseCase;

  beforeEach(() => {
    createWithTags = jest.fn().mockResolvedValue({ id: 'event-1' });
    repository = { createWithTags };
    useCase = new CreateEventUseCase(repository);
  });

  it('creates an event with trimmed fields and normalized unique tags', async () => {
    const result = await useCase.execute({
      userId: 'user-1',
      fromDateTime: '2026-06-05T08:29:00.000Z',
      toDateTime: '2026-06-05T09:29:00.000Z',
      name: '  Clase de matematica  ',
      description: '  Repasar limites  ',
      notes: '  Llevar cuaderno  ',
      tags: [' Universidad ', 'universidad', ' Analisis '],
    });

    expect(result).toEqual({ id: 'event-1' });
    expect(createWithTags).toHaveBeenCalledTimes(1);

    const [event, tags] = createWithTags.mock.calls[0] as [
      EventToCreate,
      TagToCreate[],
    ];

    expect(event).toMatchObject({
      name: 'Clase de matematica',
      description: 'Repasar limites',
      notes: 'Llevar cuaderno',
      userId: 'user-1',
    });
    expect(event.fromDateTime).toEqual(new Date('2026-06-05T08:29:00.000Z'));
    expect(event.toDateTime).toEqual(new Date('2026-06-05T09:29:00.000Z'));
    expect(tags).toEqual([
      { name: 'universidad', label: 'universidad' },
      { name: 'analisis', label: 'Analisis' },
    ]);
  });

  it('uses empty optional text fields and tags by default', async () => {
    await useCase.execute({
      userId: 'user-1',
      fromDateTime: '2026-06-05T08:29:00.000Z',
      toDateTime: '2026-06-05T09:29:00.000Z',
      name: 'Evento',
    });

    expect(createWithTags).toHaveBeenCalledWith(
      expect.objectContaining({
        description: '',
        notes: '',
      }),
      [],
    );
  });

  it('rejects commands without user id', async () => {
    await expect(
      useCase.execute({
        userId: '',
        fromDateTime: '2026-06-05T08:29:00.000Z',
        toDateTime: '2026-06-05T09:29:00.000Z',
        name: 'Evento',
      }),
    ).rejects.toMatchObject<CreateEventValidationError>({
      fields: ['userId'],
    });

    expect(createWithTags).not.toHaveBeenCalled();
  });

  it('rejects blank event names', async () => {
    await expect(
      useCase.execute({
        userId: 'user-1',
        fromDateTime: '2026-06-05T08:29:00.000Z',
        toDateTime: '2026-06-05T09:29:00.000Z',
        name: '   ',
      }),
    ).rejects.toMatchObject<CreateEventValidationError>({
      fields: ['name'],
    });

    expect(createWithTags).not.toHaveBeenCalled();
  });

  it('rejects invalid dates', async () => {
    await expect(
      useCase.execute({
        userId: 'user-1',
        fromDateTime: 'not-a-date',
        toDateTime: '2026-06-05T09:29:00.000Z',
        name: 'Evento',
      }),
    ).rejects.toMatchObject<CreateEventValidationError>({
      fields: ['fromDateTime'],
    });

    expect(createWithTags).not.toHaveBeenCalled();
  });

  it('rejects events where start date is after end date', async () => {
    await expect(
      useCase.execute({
        userId: 'user-1',
        fromDateTime: '2026-06-05T10:29:00.000Z',
        toDateTime: '2026-06-05T09:29:00.000Z',
        name: 'Evento',
      }),
    ).rejects.toMatchObject<CreateEventValidationError>({
      fields: ['fromDateTime', 'toDateTime'],
    });

    expect(createWithTags).not.toHaveBeenCalled();
  });
});
