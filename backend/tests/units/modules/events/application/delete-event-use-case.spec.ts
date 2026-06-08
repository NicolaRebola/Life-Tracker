import { DeleteEventUseCase } from 'src/modules/events/application/use-cases/delete-event-use-case';
import { DeleteEventValidationError } from 'src/modules/events/application/errors/delete-event-validation.error';
import { EventNotFoundError } from 'src/modules/events/application/errors/event-not-found.error';
import type { EventRepositoryPort } from 'src/modules/events/domain';

describe('DeleteEventUseCase', () => {
  let softDelete: jest.Mock;
  let repository: EventRepositoryPort;
  let useCase: DeleteEventUseCase;

  beforeEach(() => {
    softDelete = jest.fn().mockResolvedValue(true);
    repository = {
      save: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      searchTagsByName: jest.fn(),
      findByIdForUser: jest.fn(),
      applyStatusTransition: jest.fn(),
      softDelete,
      purgeDeletedBefore: jest.fn(),
    };
    useCase = new DeleteEventUseCase(repository);
  });

  it('soft deletes an event for the authenticated user', async () => {
    await expect(
      useCase.execute({
        userId: 'user-1',
        eventId: 'event-1',
      }),
    ).resolves.toBeUndefined();

    expect(softDelete).toHaveBeenCalledWith(
      'user-1',
      'event-1',
      expect.any(Date),
    );
  });

  it('throws when the event does not exist or is already deleted', async () => {
    softDelete.mockResolvedValueOnce(false);

    await expect(
      useCase.execute({
        userId: 'user-1',
        eventId: 'missing-event',
      }),
    ).rejects.toBeInstanceOf(EventNotFoundError);
  });

  it('rejects invalid event ids', async () => {
    await expect(
      useCase.execute({
        userId: 'user-1',
        eventId: '   ',
      }),
    ).rejects.toMatchObject<DeleteEventValidationError>({
      fields: ['eventId'],
    } as DeleteEventValidationError);

    expect(softDelete).not.toHaveBeenCalled();
  });
});
