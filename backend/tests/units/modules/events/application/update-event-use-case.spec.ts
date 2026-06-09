import { UpdateEventUseCase } from 'src/modules/events/application/use-cases/update-event-use-case';
import { UpdateEventValidationError } from 'src/modules/events/application/errors/update-event-validation.error';
import { EventNotFoundError } from 'src/modules/events/application/errors/event-not-found.error';
import { Event } from 'src/modules/events/domain';
import type { EventRepositoryPort } from 'src/modules/events/domain';

describe('UpdateEventUseCase', () => {
  let findByIdForUser: jest.Mock;
  let update: jest.Mock<Promise<Event>, [Event]>;
  let repository: EventRepositoryPort;
  let useCase: UpdateEventUseCase;

  const existingEvent = Event.rehydrate({
    id: 'event-1',
    userId: 'user-1',
    name: 'Evento original',
    description: 'Descripcion original',
    notes: 'Nota original',
    fromDateTime: new Date('2026-06-05T08:29:00.000Z'),
    toDateTime: new Date('2026-06-05T09:29:00.000Z'),
    status: 'IN_PROGRESS',
    tags: [{ name: 'universidad', label: 'Universidad' }],
  });

  beforeEach(() => {
    findByIdForUser = jest.fn().mockResolvedValue(existingEvent);
    update = jest.fn((event: Event) =>
      Promise.resolve(
        Event.rehydrate({
          ...event.toPrimitives(),
          id: 'event-1',
        }),
      ),
    );
    repository = {
      save: jest.fn(),
      update,
      findMany: jest.fn(),
      searchTagsByName: jest.fn(),
      findByIdForUser,
      applyStatusTransition: jest.fn(),
      softDelete: jest.fn(),
      purgeDeletedBefore: jest.fn(),
    };
    useCase = new UpdateEventUseCase(repository);
  });

  it('updates an event with trimmed fields and normalized unique tags', async () => {
    const result = await useCase.execute({
      userId: 'user-1',
      eventId: 'event-1',
      fromDateTime: '2026-06-06T10:00:00.000Z',
      toDateTime: '2026-06-06T11:00:00.000Z',
      name: '  Evento editado  ',
      description: '  Nueva descripcion  ',
      notes: '  Nueva nota  ',
      tags: [' Universidad ', 'universidad', ' Analisis '],
    });

    expect(result).toMatchObject({
      id: 'event-1',
      name: 'Evento editado',
      description: 'Nueva descripcion',
      notes: 'Nueva nota',
      status: 'IN_PROGRESS',
    });
    expect(result.fromDateTime).toBe('2026-06-06T10:00:00.000Z');
    expect(result.toDateTime).toBe('2026-06-06T11:00:00.000Z');
    expect(result.tags).toEqual([
      { name: 'universidad', label: 'universidad' },
      { name: 'analisis', label: 'Analisis' },
    ]);
    expect(findByIdForUser).toHaveBeenCalledWith('user-1', 'event-1');
    expect(update).toHaveBeenCalledTimes(1);

    const updatedEvent = update.mock.calls[0][0];
    expect(updatedEvent.toPrimitives()).toMatchObject({
      id: 'event-1',
      userId: 'user-1',
      status: 'IN_PROGRESS',
    });
  });

  it('throws when the event does not exist', async () => {
    findByIdForUser.mockResolvedValueOnce(null);

    await expect(
      useCase.execute({
        userId: 'user-1',
        eventId: 'missing-event',
        fromDateTime: '2026-06-06T10:00:00.000Z',
        toDateTime: '2026-06-06T11:00:00.000Z',
        name: 'Evento',
      }),
    ).rejects.toBeInstanceOf(EventNotFoundError);

    expect(update).not.toHaveBeenCalled();
  });

  it('rejects blank event names', async () => {
    await expect(
      useCase.execute({
        userId: 'user-1',
        eventId: 'event-1',
        fromDateTime: '2026-06-06T10:00:00.000Z',
        toDateTime: '2026-06-06T11:00:00.000Z',
        name: '   ',
      }),
    ).rejects.toMatchObject<UpdateEventValidationError>({
      fields: ['name'],
    } as UpdateEventValidationError);

    expect(update).not.toHaveBeenCalled();
  });

  it('rejects events where start date is after end date', async () => {
    await expect(
      useCase.execute({
        userId: 'user-1',
        eventId: 'event-1',
        fromDateTime: '2026-06-06T12:00:00.000Z',
        toDateTime: '2026-06-06T11:00:00.000Z',
        name: 'Evento',
      }),
    ).rejects.toMatchObject<UpdateEventValidationError>({
      fields: ['fromDateTime', 'toDateTime'],
    } as UpdateEventValidationError);

    expect(update).not.toHaveBeenCalled();
  });

  it('rejects invalid event ids', async () => {
    await expect(
      useCase.execute({
        userId: 'user-1',
        eventId: '   ',
        fromDateTime: '2026-06-06T10:00:00.000Z',
        toDateTime: '2026-06-06T11:00:00.000Z',
        name: 'Evento',
      }),
    ).rejects.toMatchObject<UpdateEventValidationError>({
      fields: ['eventId'],
    } as UpdateEventValidationError);

    expect(findByIdForUser).not.toHaveBeenCalled();
  });
});
