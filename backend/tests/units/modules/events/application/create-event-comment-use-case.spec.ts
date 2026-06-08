import { CreateEventCommentUseCase } from 'src/modules/events/application/use-cases/create-event-comment-use-case';
import { CreateEventCommentValidationError } from 'src/modules/events/application/errors/create-event-comment-validation.error';
import { EventNotFoundError } from 'src/modules/events/application/errors/event-not-found.error';
import { Event } from 'src/modules/events/domain';
import type {
  EventCommentRepositoryPort,
  EventRepositoryPort,
} from 'src/modules/events/domain';

describe('CreateEventCommentUseCase', () => {
  let eventRepository: EventRepositoryPort;
  let eventCommentRepository: EventCommentRepositoryPort;
  let useCase: CreateEventCommentUseCase;

  beforeEach(() => {
    eventRepository = {
      save: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      searchTagsByName: jest.fn(),
      findByIdForUser: jest.fn().mockResolvedValue(
        Event.rehydrate({
          id: 'event-1',
          userId: 'user-1',
          name: 'Evento',
          description: 'Descripcion',
          notes: '',
          fromDateTime: new Date('2026-06-05T08:29:00.000Z'),
          toDateTime: new Date('2026-06-05T09:29:00.000Z'),
          status: 'TODO',
          tags: [],
        }),
      ),
      applyStatusTransition: jest.fn(),
      softDelete: jest.fn(),
      purgeDeletedBefore: jest.fn(),
    };
    eventCommentRepository = {
      save: jest.fn().mockResolvedValue({
        id: 'comment-1',
        eventId: 'event-1',
        userId: 'user-1',
        body: 'Comentario',
        createdAt: new Date('2026-06-08T10:00:00.000Z'),
        updatedAt: new Date('2026-06-08T10:00:00.000Z'),
        author: {
          id: 'user-1',
          displayName: 'Test User',
          email: 'test@example.com',
        },
      }),
      findManyByEventForUser: jest.fn(),
      findByIdForUser: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      countByEventIds: jest.fn(),
    };
    useCase = new CreateEventCommentUseCase(
      eventRepository,
      eventCommentRepository,
    );
  });

  it('creates a comment for an existing event', async () => {
    const result = await useCase.execute({
      userId: 'user-1',
      eventId: 'event-1',
      body: '  Comentario  ',
    });

    expect(result.comment).toMatchObject({
      id: 'comment-1',
      body: 'Comentario',
      isOwn: true,
    });
    expect(eventCommentRepository.save).toHaveBeenCalledTimes(1);
  });

  it('rejects comments for missing events', async () => {
    eventRepository.findByIdForUser = jest.fn().mockResolvedValue(null);

    await expect(
      useCase.execute({
        userId: 'user-1',
        eventId: 'missing-event',
        body: 'Comentario',
      }),
    ).rejects.toBeInstanceOf(EventNotFoundError);
  });

  it('rejects empty comments', async () => {
    await expect(
      useCase.execute({
        userId: 'user-1',
        eventId: 'event-1',
        body: '   ',
      }),
    ).rejects.toBeInstanceOf(CreateEventCommentValidationError);

    expect(eventCommentRepository.save).not.toHaveBeenCalled();
  });
});
