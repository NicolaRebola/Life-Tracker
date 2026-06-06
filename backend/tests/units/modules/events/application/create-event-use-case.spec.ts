import { CreateEventUseCase } from 'src/modules/events/application/use-cases/create-event-use-case';
import { CreateEventValidationError } from 'src/modules/events/application/errors/create-event-validation.error';
import { Event } from 'src/modules/events/domain';
import type { EventRepositoryPort } from 'src/modules/events/domain';

describe('CreateEventUseCase', () => {
  let save: jest.Mock<Promise<Event>, [Event]>;
  let repository: EventRepositoryPort;
  let useCase: CreateEventUseCase;

  beforeEach(() => {
    save = jest.fn((event: Event) =>
      Promise.resolve(
        Event.rehydrate({
          ...event.toPrimitives(),
          id: 'event-1',
        }),
      ),
    );
    repository = { save };
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
    expect(save).toHaveBeenCalledTimes(1);

    const event = save.mock.calls[0][0];
    const props = event.toPrimitives();

    expect(props).toMatchObject({
      name: 'Clase de matematica',
      description: 'Repasar limites',
      notes: 'Llevar cuaderno',
      userId: 'user-1',
    });
    expect(props.fromDateTime).toEqual(new Date('2026-06-05T08:29:00.000Z'));
    expect(props.toDateTime).toEqual(new Date('2026-06-05T09:29:00.000Z'));
    expect(props.tags).toEqual([
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

    const event = save.mock.calls[0][0];
    expect(event.toPrimitives()).toMatchObject({
      description: '',
      notes: '',
      tags: [],
    });
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

    expect(save).not.toHaveBeenCalled();
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

    expect(save).not.toHaveBeenCalled();
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

    expect(save).not.toHaveBeenCalled();
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

    expect(save).not.toHaveBeenCalled();
  });
});
