import { UpdateEventStatusUseCase } from 'src/modules/events/application/use-cases/update-event-status-use-case';
import { EventNotFoundError } from 'src/modules/events/application/errors/event-not-found.error';
import { UpdateEventStatusValidationError } from 'src/modules/events/application/errors/update-event-status-validation.error';
import { Event } from 'src/modules/events/domain';
import type { EventRepositoryPort } from 'src/modules/events/domain';

describe('UpdateEventStatusUseCase', () => {
  let updateStatus: jest.Mock;
  let repository: EventRepositoryPort;
  let useCase: UpdateEventStatusUseCase;

  beforeEach(() => {
    updateStatus = jest.fn().mockResolvedValue(
      Event.rehydrate({
        id: 'event-1',
        userId: 'user-1',
        name: 'Evento',
        description: '',
        notes: '',
        fromDateTime: new Date('2026-06-05T08:29:00.000Z'),
        toDateTime: new Date('2026-06-05T09:29:00.000Z'),
        status: 'DONE',
        tags: [],
      }),
    );
    repository = {
      save: jest.fn(),
      findMany: jest.fn(),
      searchTagsByName: jest.fn(),
      updateStatus,
    };
    useCase = new UpdateEventStatusUseCase(repository);
  });

  it('updates the event status for the authenticated user', async () => {
    const result = await useCase.execute({
      userId: 'user-1',
      eventId: 'event-1',
      status: 'DONE',
    });

    expect(updateStatus).toHaveBeenCalledWith('user-1', 'event-1', 'DONE');
    expect(result).toEqual({ id: 'event-1', status: 'DONE' });
  });

  it('throws when the event does not belong to the user', async () => {
    updateStatus.mockResolvedValueOnce(null);

    await expect(
      useCase.execute({
        userId: 'user-1',
        eventId: 'missing-event',
        status: 'DONE',
      }),
    ).rejects.toBeInstanceOf(EventNotFoundError);
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

    expect(updateStatus).not.toHaveBeenCalled();
  });
});
