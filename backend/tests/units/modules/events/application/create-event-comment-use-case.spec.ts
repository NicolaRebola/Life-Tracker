import { CreateEventCommentUseCase } from 'src/modules/events/application/use-cases/create-event-comment-use-case';
import { CreateEventCommentValidationError } from 'src/modules/events/application/errors/create-event-comment-validation.error';
import { EventNotFoundError } from 'src/modules/events/application/errors/event-not-found.error';
import { Event } from 'src/modules/events/domain';
import type {
  EventCommentRepositoryPort,
  EventParticipantRepositoryPort,
  EventRepositoryPort,
} from 'src/modules/events/domain';

describe('CreateEventCommentUseCase', () => {
  let save: jest.Mock;
  let eventRepository: EventRepositoryPort;
  let eventCommentRepository: EventCommentRepositoryPort;
  let eventParticipantRepository: EventParticipantRepositoryPort;
  let useCase: CreateEventCommentUseCase;

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
    save = jest.fn().mockResolvedValue({
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
    });
    eventCommentRepository = {
      save,
      findManyByEventForUser: jest.fn(),
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
    useCase = new CreateEventCommentUseCase(
      eventRepository,
      eventCommentRepository,
      eventParticipantRepository,
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
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('rejects comments for missing events', async () => {
    eventRepository.findByIdForOwner = jest.fn().mockResolvedValue(null);

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

    expect(save).not.toHaveBeenCalled();
  });

  it('creates a comment for an authenticated participant', async () => {
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
    save.mockResolvedValue({
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
    });

    const result = await useCase.execute({
      userId: 'user-2',
      userEmail: 'participant@example.com',
      eventId: 'event-1',
      body: 'Comentario',
    });

    expect(result.comment).toMatchObject({
      participantId: 'participant-1',
      isOwn: true,
    });
    expect(save).toHaveBeenCalledTimes(1);
  });
});
