import { ListEventCommentsUseCase } from 'src/modules/events/application/use-cases/list-event-comments-use-case';
import { EventNotFoundError } from 'src/modules/events/application/errors/event-not-found.error';
import { Event } from 'src/modules/events/domain';
import type {
  EventCommentRepositoryPort,
  EventRepositoryPort,
} from 'src/modules/events/domain';

describe('ListEventCommentsUseCase', () => {
  let eventRepository: EventRepositoryPort;
  let eventCommentRepository: EventCommentRepositoryPort;
  let useCase: ListEventCommentsUseCase;

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
      save: jest.fn(),
      findManyByEventForUser: jest.fn().mockResolvedValue([
        {
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
        },
      ]),
      findByIdForUser: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      countByEventIds: jest.fn(),
    };
    useCase = new ListEventCommentsUseCase(
      eventRepository,
      eventCommentRepository,
    );
  });

  it('lists comments for an existing event', async () => {
    const result = await useCase.execute({
      userId: 'user-1',
      eventId: 'event-1',
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      id: 'comment-1',
      body: 'Comentario',
      isOwn: true,
    });
  });

  it('rejects listing comments for missing events', async () => {
    eventRepository.findByIdForUser = jest.fn().mockResolvedValue(null);

    await expect(
      useCase.execute({
        userId: 'user-1',
        eventId: 'missing-event',
      }),
    ).rejects.toBeInstanceOf(EventNotFoundError);
  });
});
