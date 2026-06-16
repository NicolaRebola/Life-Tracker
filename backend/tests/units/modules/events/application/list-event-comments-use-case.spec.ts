import { ListEventCommentsUseCase } from 'src/modules/events/application/use-cases/list-event-comments-use-case';
import { EventNotFoundError } from 'src/modules/events/application/errors/event-not-found.error';
import { Event } from 'src/modules/events/domain';
import type {
  EventCommentRepositoryPort,
  EventParticipantRepositoryPort,
  EventRepositoryPort,
} from 'src/modules/events/domain';

describe('ListEventCommentsUseCase', () => {
  let eventRepository: EventRepositoryPort;
  let eventCommentRepository: EventCommentRepositoryPort;
  let eventParticipantRepository: EventParticipantRepositoryPort;
  let useCase: ListEventCommentsUseCase;

  beforeEach(() => {
    eventRepository = {
      save: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      searchTagsByName: jest.fn(),
      findByIdForUser: jest.fn(),
      findByIdForOwner: jest.fn().mockResolvedValue(
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
      findByIdForParticipant: jest.fn(),
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
          participantId: null,
          body: 'Comentario',
          createdAt: new Date('2026-06-08T10:00:00.000Z'),
          updatedAt: new Date('2026-06-08T10:00:00.000Z'),
          author: {
            kind: 'USER',
            id: 'user-1',
            displayName: 'Test User',
            email: 'test@example.com',
          },
        },
      ]),
      findManyByEventForParticipant: jest.fn(),
      findByIdForUser: jest.fn(),
      findByIdForParticipant: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      countByEventIds: jest.fn(),
    };
    eventParticipantRepository = {
      findActiveById: jest.fn(),
      findActiveByEventAndEmail: jest.fn(),
      listByEventForOwner: jest.fn(),
      upsertAccepted: jest.fn(),
      softRevoke: jest.fn(),
    };
    useCase = new ListEventCommentsUseCase(
      eventRepository,
      eventCommentRepository,
      eventParticipantRepository,
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
    eventRepository.findByIdForOwner = jest.fn().mockResolvedValue(null);

    await expect(
      useCase.execute({
        userId: 'user-1',
        eventId: 'missing-event',
      }),
    ).rejects.toBeInstanceOf(EventNotFoundError);
  });

  it('lists comments for an authenticated participant', async () => {
    eventRepository.findByIdForOwner = jest.fn().mockResolvedValue(null);
    eventParticipantRepository.findActiveByEventAndEmail = jest.fn().mockResolvedValue({
      id: 'participant-1',
      eventId: 'event-1',
      email: 'participant@example.com',
      displayName: 'Participant',
      userId: 'user-2',
      joinedAt: new Date('2026-06-08T10:00:00.000Z'),
      revokedAt: null,
    });
    eventRepository.findByIdForParticipant = jest.fn().mockResolvedValue(
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
    );
    eventCommentRepository.findManyByEventForParticipant = jest.fn().mockResolvedValue([
      {
        id: 'comment-1',
        eventId: 'event-1',
        userId: null,
        participantId: 'participant-1',
        body: 'Comentario',
        createdAt: new Date('2026-06-08T10:00:00.000Z'),
        updatedAt: new Date('2026-06-08T10:00:00.000Z'),
        author: {
          kind: 'PARTICIPANT',
          id: 'participant-1',
          displayName: 'Participant',
          email: 'participant@example.com',
        },
      },
    ]);

    const result = await useCase.execute({
      userId: 'user-2',
      userEmail: 'participant@example.com',
      eventId: 'event-1',
    });

    expect(result.items[0]).toMatchObject({
      id: 'comment-1',
      isOwn: true,
    });
  });
});
