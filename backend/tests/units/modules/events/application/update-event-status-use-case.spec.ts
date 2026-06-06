import { UpdateEventStatusUseCase } from 'src/modules/events/application/use-cases/update-event-status-use-case';
import { EventNotFoundError } from 'src/modules/events/application/errors/event-not-found.error';
import { UpdateEventStatusConflictError } from 'src/modules/events/application/errors/update-event-status-conflict.error';
import { UpdateEventStatusValidationError } from 'src/modules/events/application/errors/update-event-status-validation.error';
import { Event } from 'src/modules/events/domain';
import type { EventRepositoryPort } from 'src/modules/events/domain';
import type { EventStatus } from 'src/modules/events/domain/entities/event-status';

describe('UpdateEventStatusUseCase', () => {
  let findByIdForUser: jest.Mock;
  let applyStatusTransition: jest.Mock;
  let repository: EventRepositoryPort;
  let useCase: UpdateEventStatusUseCase;

  const baseEvent = {
    id: 'event-1',
    userId: 'user-1',
    name: 'Evento',
    description: '',
    notes: '',
    fromDateTime: new Date('2026-06-05T08:29:00.000Z'),
    toDateTime: new Date('2026-06-05T09:29:00.000Z'),
    tags: [] as { name: string; label: string }[],
  };

  function eventWithStatus(status: EventStatus) {
    return Event.rehydrate({ ...baseEvent, status });
  }

  beforeEach(() => {
    findByIdForUser = jest
      .fn()
      .mockResolvedValue(eventWithStatus('IN_PROGRESS'));
    applyStatusTransition = jest.fn().mockResolvedValue({
      event: eventWithStatus('DONE'),
      applied: true,
    });
    repository = {
      save: jest.fn(),
      findMany: jest.fn(),
      searchTagsByName: jest.fn(),
      findByIdForUser,
      applyStatusTransition,
    };
    useCase = new UpdateEventStatusUseCase(repository);
  });

  it('applies IN_PROGRESS -> DONE transition for the authenticated user', async () => {
    const result = await useCase.execute({
      userId: 'user-1',
      eventId: 'event-1',
      status: 'DONE',
    });

    expect(findByIdForUser).toHaveBeenCalledWith('user-1', 'event-1');
    expect(applyStatusTransition).toHaveBeenCalledWith({
      userId: 'user-1',
      eventId: 'event-1',
      fromStatus: 'IN_PROGRESS',
      toStatus: 'DONE',
    });
    expect(result).toEqual({ id: 'event-1', status: 'DONE' });
  });

  it('applies TODO -> IN_PROGRESS transition', async () => {
    findByIdForUser.mockResolvedValueOnce(eventWithStatus('TODO'));
    applyStatusTransition.mockResolvedValueOnce({
      event: eventWithStatus('IN_PROGRESS'),
      applied: true,
    });

    const result = await useCase.execute({
      userId: 'user-1',
      eventId: 'event-1',
      status: 'IN_PROGRESS',
    });

    expect(applyStatusTransition).toHaveBeenCalledWith({
      userId: 'user-1',
      eventId: 'event-1',
      fromStatus: 'TODO',
      toStatus: 'IN_PROGRESS',
    });
    expect(result).toEqual({ id: 'event-1', status: 'IN_PROGRESS' });
  });

  it('applies IN_PROGRESS -> TODO transition', async () => {
    applyStatusTransition.mockResolvedValueOnce({
      event: eventWithStatus('TODO'),
      applied: true,
    });

    const result = await useCase.execute({
      userId: 'user-1',
      eventId: 'event-1',
      status: 'TODO',
    });

    expect(applyStatusTransition).toHaveBeenCalledWith({
      userId: 'user-1',
      eventId: 'event-1',
      fromStatus: 'IN_PROGRESS',
      toStatus: 'TODO',
    });
    expect(result).toEqual({ id: 'event-1', status: 'TODO' });
  });

  it('applies DONE -> IN_PROGRESS transition', async () => {
    findByIdForUser.mockResolvedValueOnce(eventWithStatus('DONE'));
    applyStatusTransition.mockResolvedValueOnce({
      event: eventWithStatus('IN_PROGRESS'),
      applied: true,
    });

    const result = await useCase.execute({
      userId: 'user-1',
      eventId: 'event-1',
      status: 'IN_PROGRESS',
    });

    expect(applyStatusTransition).toHaveBeenCalledWith({
      userId: 'user-1',
      eventId: 'event-1',
      fromStatus: 'DONE',
      toStatus: 'IN_PROGRESS',
    });
    expect(result).toEqual({ id: 'event-1', status: 'IN_PROGRESS' });
  });

  it('rejects non-adjacent TODO -> DONE transition', async () => {
    findByIdForUser.mockResolvedValueOnce(eventWithStatus('TODO'));

    await expect(
      useCase.execute({
        userId: 'user-1',
        eventId: 'event-1',
        status: 'DONE',
      }),
    ).rejects.toMatchObject<UpdateEventStatusValidationError>({
      fields: ['status'],
    });

    expect(applyStatusTransition).not.toHaveBeenCalled();
  });

  it('rejects non-adjacent DONE -> TODO transition', async () => {
    findByIdForUser.mockResolvedValueOnce(eventWithStatus('DONE'));

    await expect(
      useCase.execute({
        userId: 'user-1',
        eventId: 'event-1',
        status: 'TODO',
      }),
    ).rejects.toMatchObject<UpdateEventStatusValidationError>({
      fields: ['status'],
    });

    expect(applyStatusTransition).not.toHaveBeenCalled();
  });

  it('returns success without writing when status is unchanged', async () => {
    const result = await useCase.execute({
      userId: 'user-1',
      eventId: 'event-1',
      status: 'IN_PROGRESS',
    });

    expect(result).toEqual({ id: 'event-1', status: 'IN_PROGRESS' });
    expect(applyStatusTransition).not.toHaveBeenCalled();
  });

  it('throws when the event does not belong to the user', async () => {
    findByIdForUser.mockResolvedValueOnce(null);

    await expect(
      useCase.execute({
        userId: 'user-1',
        eventId: 'missing-event',
        status: 'DONE',
      }),
    ).rejects.toBeInstanceOf(EventNotFoundError);

    expect(applyStatusTransition).not.toHaveBeenCalled();
  });

  it('rejects invalid status values', async () => {
    await expect(
      useCase.execute({
        userId: 'user-1',
        eventId: 'event-1',
        status: 'INVALID' as 'TODO',
      }),
    ).rejects.toMatchObject<UpdateEventStatusValidationError>({
      fields: ['status'],
    });

    expect(findByIdForUser).not.toHaveBeenCalled();
    expect(applyStatusTransition).not.toHaveBeenCalled();
  });

  it('resolves idempotent race when another request already applied the transition', async () => {
    applyStatusTransition.mockResolvedValueOnce({
      event: eventWithStatus('DONE'),
      applied: false,
    });

    const result = await useCase.execute({
      userId: 'user-1',
      eventId: 'event-1',
      status: 'DONE',
    });

    expect(result).toEqual({ id: 'event-1', status: 'DONE' });
  });

  it('throws conflict when concurrent update leaves event in a different state', async () => {
    applyStatusTransition.mockResolvedValueOnce({
      event: eventWithStatus('TODO'),
      applied: false,
    });

    await expect(
      useCase.execute({
        userId: 'user-1',
        eventId: 'event-1',
        status: 'DONE',
      }),
    ).rejects.toBeInstanceOf(UpdateEventStatusConflictError);
  });
});
