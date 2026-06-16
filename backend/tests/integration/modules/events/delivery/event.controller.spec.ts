import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Server } from 'http';
import request from 'supertest';
import { EventController } from 'src/modules/events/delivery/event.controller';
import { CREATE_EVENT_COMMENT } from 'src/modules/events/application/ports/inbound/create-event-comment.port';
import { CREATE_EVENT } from 'src/modules/events/application/ports/inbound/create-event.port';
import { DELETE_EVENT_COMMENT } from 'src/modules/events/application/ports/inbound/delete-event-comment.port';
import { LIST_EVENT_COMMENTS } from 'src/modules/events/application/ports/inbound/list-event-comments.port';
import { LIST_EVENTS } from 'src/modules/events/application/ports/inbound/list-events.port';
import { SEARCH_EVENT_TAGS } from 'src/modules/events/application/ports/inbound/search-event-tags.port';
import { UPDATE_EVENT_COMMENT } from 'src/modules/events/application/ports/inbound/update-event-comment.port';
import { UPDATE_EVENT_STATUS } from 'src/modules/events/application/ports/inbound/update-event-status.port';
import { UPDATE_EVENT } from 'src/modules/events/application/ports/inbound/update-event.port';
import { DELETE_EVENT } from 'src/modules/events/application/ports/inbound/delete-event.port';
import { INVITE_EVENT_PARTICIPANT } from 'src/modules/events/application/ports/inbound/invite-event-participant.port';
import { LIST_EVENT_PARTICIPANTS } from 'src/modules/events/application/ports/inbound/list-event-participants.port';
import { REMOVE_EVENT_PARTICIPANT } from 'src/modules/events/application/ports/inbound/remove-event-participant.port';
import { CreateEventCommentValidationError } from 'src/modules/events/application/errors/create-event-comment-validation.error';
import { EventParticipantNotFoundError } from 'src/modules/events/application/errors/event-participant-not-found.error';
import { InviteEventParticipantValidationError } from 'src/modules/events/application/errors/invite-event-participant-validation.error';
import { CreateEventValidationError } from 'src/modules/events/application/errors/create-event-validation.error';
import { DeleteEventValidationError } from 'src/modules/events/application/errors/delete-event-validation.error';
import { EventCommentNotFoundError } from 'src/modules/events/application/errors/event-comment-not-found.error';
import { EventNotFoundError } from 'src/modules/events/application/errors/event-not-found.error';
import { ListEventsValidationError } from 'src/modules/events/application/errors/list-events-validation.error';
import { UpdateEventStatusConflictError } from 'src/modules/events/application/errors/update-event-status-conflict.error';
import { UpdateEventStatusValidationError } from 'src/modules/events/application/errors/update-event-status-validation.error';
import { UpdateEventValidationError } from 'src/modules/events/application/errors/update-event-validation.error';
import {
  AuthenticatedRequest,
  SessionGuard,
} from 'src/modules/session/application/session.guard';

describe('EventController (integration)', () => {
  let app: INestApplication;
  let createEventUseCase: { execute: jest.Mock };
  let createEventCommentUseCase: { execute: jest.Mock };
  let listEventsUseCase: { execute: jest.Mock };
  let listEventCommentsUseCase: { execute: jest.Mock };
  let searchEventTagsUseCase: { execute: jest.Mock };
  let updateEventStatusUseCase: { execute: jest.Mock };
  let updateEventCommentUseCase: { execute: jest.Mock };
  let updateEventUseCase: { execute: jest.Mock };
  let deleteEventUseCase: { execute: jest.Mock };
  let deleteEventCommentUseCase: { execute: jest.Mock };
  let inviteEventParticipantUseCase: { execute: jest.Mock };
  let listEventParticipantsUseCase: { execute: jest.Mock };
  let removeEventParticipantUseCase: { execute: jest.Mock };

  const userCommentAuthor = {
    kind: 'USER' as const,
    id: 'user-1',
    displayName: 'Test User',
    email: 'test@example.com',
  };

  beforeEach(async () => {
    createEventUseCase = {
      execute: jest.fn().mockResolvedValue({ id: 'event-1' }),
    };
    createEventCommentUseCase = {
      execute: jest.fn().mockResolvedValue({
        comment: {
          id: 'comment-1',
          eventId: 'event-1',
          userId: 'user-1',
          participantId: null,
          body: 'Comentario',
          createdAt: '2026-06-08T10:00:00.000Z',
          updatedAt: '2026-06-08T10:00:00.000Z',
          isOwn: true,
          author: userCommentAuthor,
        },
      }),
    };
    listEventsUseCase = {
      execute: jest.fn().mockResolvedValue({
        items: [
          {
            id: 'event-1',
            name: 'Evento',
            description: 'Descripcion',
            notes: '',
            fromDateTime: '2026-06-05T08:29:00.000Z',
            toDateTime: '2026-06-05T09:29:00.000Z',
            status: 'TODO',
            tags: [],
            commentCount: 1,
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      }),
    };
    listEventCommentsUseCase = {
      execute: jest.fn().mockResolvedValue({
        items: [
          {
            id: 'comment-1',
            eventId: 'event-1',
            userId: 'user-1',
            participantId: null,
            body: 'Comentario',
            createdAt: '2026-06-08T10:00:00.000Z',
            updatedAt: '2026-06-08T10:00:00.000Z',
            isOwn: true,
            author: userCommentAuthor,
          },
        ],
      }),
    };
    searchEventTagsUseCase = {
      execute: jest.fn().mockResolvedValue({
        items: [{ name: 'universidad', label: 'Universidad' }],
      }),
    };
    updateEventStatusUseCase = {
      execute: jest.fn().mockResolvedValue({ id: 'event-1', status: 'DONE' }),
    };
    updateEventCommentUseCase = {
      execute: jest.fn().mockResolvedValue({
        comment: {
          id: 'comment-1',
          eventId: 'event-1',
          userId: 'user-1',
          participantId: null,
          body: 'Comentario editado',
          createdAt: '2026-06-08T10:00:00.000Z',
          updatedAt: '2026-06-08T10:30:00.000Z',
          isOwn: true,
          author: userCommentAuthor,
        },
      }),
    };
    updateEventUseCase = {
      execute: jest.fn().mockResolvedValue({
        id: 'event-1',
        name: 'Evento editado',
        description: 'Descripcion editada',
        notes: 'Notas editadas',
        fromDateTime: '2026-06-06T10:00:00.000Z',
        toDateTime: '2026-06-06T11:00:00.000Z',
        status: 'TODO',
        tags: [{ name: 'universidad', label: 'Universidad' }],
      }),
    };
    deleteEventUseCase = {
      execute: jest.fn().mockResolvedValue(undefined),
    };
    deleteEventCommentUseCase = {
      execute: jest.fn().mockResolvedValue(undefined),
    };
    inviteEventParticipantUseCase = {
      execute: jest.fn().mockResolvedValue({
        invitation: {
          id: 'invitation-1',
          eventId: 'event-1',
          invitedEmail: 'guest@example.com',
          channel: 'EMAIL',
          status: 'PENDING',
          expiresAt: '2026-06-09T10:00:00.000Z',
        },
      }),
    };
    listEventParticipantsUseCase = {
      execute: jest.fn().mockResolvedValue({
        items: [
          {
            id: 'participant-1',
            email: 'guest@example.com',
            displayName: null,
            status: 'ACCEPTED',
            joinedAt: '2026-06-08T10:00:00.000Z',
          },
        ],
      }),
    };
    removeEventParticipantUseCase = {
      execute: jest.fn().mockResolvedValue(undefined),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [
        {
          provide: CREATE_EVENT,
          useValue: createEventUseCase,
        },
        {
          provide: CREATE_EVENT_COMMENT,
          useValue: createEventCommentUseCase,
        },
        {
          provide: LIST_EVENTS,
          useValue: listEventsUseCase,
        },
        {
          provide: LIST_EVENT_COMMENTS,
          useValue: listEventCommentsUseCase,
        },
        {
          provide: SEARCH_EVENT_TAGS,
          useValue: searchEventTagsUseCase,
        },
        {
          provide: UPDATE_EVENT_COMMENT,
          useValue: updateEventCommentUseCase,
        },
        {
          provide: UPDATE_EVENT_STATUS,
          useValue: updateEventStatusUseCase,
        },
        {
          provide: UPDATE_EVENT,
          useValue: updateEventUseCase,
        },
        {
          provide: DELETE_EVENT,
          useValue: deleteEventUseCase,
        },
        {
          provide: DELETE_EVENT_COMMENT,
          useValue: deleteEventCommentUseCase,
        },
        {
          provide: INVITE_EVENT_PARTICIPANT,
          useValue: inviteEventParticipantUseCase,
        },
        {
          provide: LIST_EVENT_PARTICIPANTS,
          useValue: listEventParticipantsUseCase,
        },
        {
          provide: REMOVE_EVENT_PARTICIPANT,
          useValue: removeEventParticipantUseCase,
        },
      ],
    })
      .overrideGuard(SessionGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
          req.user = {
            id: 'user-1',
            email: 'test@example.com',
            displayName: 'Test User',
          };
          req.session = { id: 'session-1' };
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('creates an event for the authenticated user', async () => {
    const payload = {
      fromDateTime: '2026-06-05T08:29:00.000Z',
      toDateTime: '2026-06-05T09:29:00.000Z',
      name: 'Evento',
      description: 'Descripcion',
      notes: 'Notas',
      tags: ['universidad'],
    };

    await request(app.getHttpServer() as Server)
      .post('/events')
      .send(payload)
      .expect(201)
      .expect({ event: { id: 'event-1' } });

    expect(createEventUseCase.execute).toHaveBeenCalledWith({
      userId: 'user-1',
      ...payload,
    });
  });

  it('lists events for the authenticated user with query params', async () => {
    await request(app.getHttpServer() as Server)
      .get('/events')
      .query({
        name: 'clase',
        status: 'TODO',
        tags: 'universidad,analisis',
        page: '2',
        limit: '5',
      })
      .expect(200)
      .expect(
        ({
          body,
        }: {
          body: {
            items: unknown[];
            pagination: { total: number };
          };
        }) => {
          expect(body.items).toHaveLength(1);
          expect(body.pagination.total).toBe(1);
        },
      );

    expect(listEventsUseCase.execute).toHaveBeenCalledWith({
      userId: 'user-1',
      userEmail: 'test@example.com',
      name: 'clase',
      status: 'TODO',
      tags: ['universidad', 'analisis'],
      page: 2,
      limit: 5,
    });
  });

  it('maps list validation errors to bad request responses', async () => {
    listEventsUseCase.execute.mockRejectedValueOnce(
      new ListEventsValidationError('Límite inválido', ['limit']),
    );

    await request(app.getHttpServer() as Server)
      .get('/events')
      .query({ limit: '15' })
      .expect(400)
      .expect(({ body }: { body: { message: string; fields: string[] } }) => {
        expect(body.message).toBe('Límite inválido');
        expect(body.fields).toEqual(['limit']);
      });
  });

  it('searches event tags for the authenticated user', async () => {
    await request(app.getHttpServer() as Server)
      .get('/events/tags')
      .query({ name: 'uni', limit: '10' })
      .expect(200)
      .expect({
        items: [{ name: 'universidad', label: 'Universidad' }],
      });

    expect(searchEventTagsUseCase.execute).toHaveBeenCalledWith({
      userId: 'user-1',
      name: 'uni',
      limit: 10,
    });
  });

  it('updates event status for the authenticated user', async () => {
    await request(app.getHttpServer() as Server)
      .patch('/events/event-1/status')
      .send({ status: 'DONE' })
      .expect(200)
      .expect({ event: { id: 'event-1', status: 'DONE' } });

    expect(updateEventStatusUseCase.execute).toHaveBeenCalledWith({
      userId: 'user-1',
      eventId: 'event-1',
      status: 'DONE',
    });
  });

  it('maps not found errors when updating status', async () => {
    updateEventStatusUseCase.execute.mockRejectedValueOnce(
      new EventNotFoundError(),
    );

    await request(app.getHttpServer() as Server)
      .patch('/events/missing-event/status')
      .send({ status: 'DONE' })
      .expect(404);
  });

  it('maps invalid status transitions to bad request responses', async () => {
    updateEventStatusUseCase.execute.mockRejectedValueOnce(
      new UpdateEventStatusValidationError(
        'No se puede transicionar de TODO a DONE',
        ['status'],
      ),
    );

    await request(app.getHttpServer() as Server)
      .patch('/events/event-1/status')
      .send({ status: 'DONE' })
      .expect(400)
      .expect(({ body }: { body: { message: string; fields: string[] } }) => {
        expect(body.message).toBe('No se puede transicionar de TODO a DONE');
        expect(body.fields).toEqual(['status']);
      });
  });

  it('maps concurrent status conflicts to conflict responses', async () => {
    updateEventStatusUseCase.execute.mockRejectedValueOnce(
      new UpdateEventStatusConflictError(
        'El evento cambió de estado concurrentemente',
        'IN_PROGRESS',
        'TODO',
        'DONE',
      ),
    );

    await request(app.getHttpServer() as Server)
      .patch('/events/event-1/status')
      .send({ status: 'DONE' })
      .expect(409)
      .expect(
        ({
          body,
        }: {
          body: {
            message: string;
            fromStatus: string;
            currentStatus: string;
            requestedStatus: string;
          };
        }) => {
          expect(body.message).toBe(
            'El evento cambió de estado concurrentemente',
          );
          expect(body.fromStatus).toBe('IN_PROGRESS');
          expect(body.currentStatus).toBe('TODO');
          expect(body.requestedStatus).toBe('DONE');
        },
      );
  });

  it('maps use case validation errors to bad request responses', async () => {
    createEventUseCase.execute.mockRejectedValueOnce(
      new CreateEventValidationError('El nombre es requerido', ['name']),
    );

    await request(app.getHttpServer() as Server)
      .post('/events')
      .send({
        fromDateTime: '2026-06-05T08:29:00.000Z',
        toDateTime: '2026-06-05T09:29:00.000Z',
        name: '',
      })
      .expect(400)
      .expect(({ body }: { body: { message: string; fields: string[] } }) => {
        expect(body.message).toBe('El nombre es requerido');
        expect(body.fields).toEqual(['name']);
      });
  });

  it('updates an event for the authenticated user', async () => {
    const payload = {
      fromDateTime: '2026-06-06T10:00:00.000Z',
      toDateTime: '2026-06-06T11:00:00.000Z',
      name: 'Evento editado',
      description: 'Descripcion editada',
      notes: 'Notas editadas',
      tags: ['universidad'],
    };

    await request(app.getHttpServer() as Server)
      .patch('/events/event-1')
      .send(payload)
      .expect(200)
      .expect({
        event: {
          id: 'event-1',
          name: 'Evento editado',
          description: 'Descripcion editada',
          notes: 'Notas editadas',
          fromDateTime: '2026-06-06T10:00:00.000Z',
          toDateTime: '2026-06-06T11:00:00.000Z',
          status: 'TODO',
          tags: [{ name: 'universidad', label: 'Universidad' }],
        },
      });

    expect(updateEventUseCase.execute).toHaveBeenCalledWith({
      userId: 'user-1',
      eventId: 'event-1',
      ...payload,
    });
  });

  it('maps not found errors when updating an event', async () => {
    updateEventUseCase.execute.mockRejectedValueOnce(new EventNotFoundError());

    await request(app.getHttpServer() as Server)
      .patch('/events/missing-event')
      .send({
        fromDateTime: '2026-06-06T10:00:00.000Z',
        toDateTime: '2026-06-06T11:00:00.000Z',
        name: 'Evento editado',
      })
      .expect(404);
  });

  it('maps update validation errors to bad request responses', async () => {
    updateEventUseCase.execute.mockRejectedValueOnce(
      new UpdateEventValidationError('El nombre es requerido', ['name']),
    );

    await request(app.getHttpServer() as Server)
      .patch('/events/event-1')
      .send({
        fromDateTime: '2026-06-06T10:00:00.000Z',
        toDateTime: '2026-06-06T11:00:00.000Z',
        name: '',
      })
      .expect(400)
      .expect(({ body }: { body: { message: string; fields: string[] } }) => {
        expect(body.message).toBe('El nombre es requerido');
        expect(body.fields).toEqual(['name']);
      });
  });

  it('lists event participants for the authenticated user', async () => {
    await request(app.getHttpServer() as Server)
      .get('/events/event-1/participants')
      .expect(200)
      .expect({
        items: [
          {
            id: 'participant-1',
            email: 'guest@example.com',
            displayName: null,
            status: 'ACCEPTED',
            joinedAt: '2026-06-08T10:00:00.000Z',
          },
        ],
      });

    expect(listEventParticipantsUseCase.execute).toHaveBeenCalledWith({
      userId: 'user-1',
      eventId: 'event-1',
    });
  });

  it('maps not found errors when listing participants', async () => {
    listEventParticipantsUseCase.execute.mockRejectedValueOnce(
      new EventNotFoundError(),
    );

    await request(app.getHttpServer() as Server)
      .get('/events/missing-event/participants')
      .expect(404);
  });

  it('invites a participant by email', async () => {
    await request(app.getHttpServer() as Server)
      .post('/events/event-1/invitations')
      .send({ email: 'guest@example.com' })
      .expect(201)
      .expect({
        invitation: {
          id: 'invitation-1',
          eventId: 'event-1',
          invitedEmail: 'guest@example.com',
          channel: 'EMAIL',
          status: 'PENDING',
          expiresAt: '2026-06-09T10:00:00.000Z',
        },
      });

    expect(inviteEventParticipantUseCase.execute).toHaveBeenCalledWith({
      userId: 'user-1',
      eventId: 'event-1',
      email: 'guest@example.com',
    });
  });

  it('maps invite validation errors to bad request responses', async () => {
    inviteEventParticipantUseCase.execute.mockRejectedValueOnce(
      new InviteEventParticipantValidationError('Email inválido', ['email']),
    );

    await request(app.getHttpServer() as Server)
      .post('/events/event-1/invitations')
      .send({ email: 'invalid' })
      .expect(400)
      .expect(({ body }: { body: { message: string; fields: string[] } }) => {
        expect(body.message).toBe('Email inválido');
        expect(body.fields).toEqual(['email']);
      });
  });

  it('removes a participant from an event', async () => {
    await request(app.getHttpServer() as Server)
      .delete('/events/event-1/participants/participant-1')
      .expect(204);

    expect(removeEventParticipantUseCase.execute).toHaveBeenCalledWith({
      userId: 'user-1',
      eventId: 'event-1',
      participantId: 'participant-1',
    });
  });

  it('maps not found errors when removing a participant', async () => {
    removeEventParticipantUseCase.execute.mockRejectedValueOnce(
      new EventParticipantNotFoundError(),
    );

    await request(app.getHttpServer() as Server)
      .delete('/events/event-1/participants/missing-participant')
      .expect(404);
  });

  it('lists comments for an event', async () => {
    await request(app.getHttpServer() as Server)
      .get('/events/event-1/comments')
      .expect(200)
      .expect({
        items: [
          {
            id: 'comment-1',
            eventId: 'event-1',
            userId: 'user-1',
            participantId: null,
            body: 'Comentario',
            createdAt: '2026-06-08T10:00:00.000Z',
            updatedAt: '2026-06-08T10:00:00.000Z',
            isOwn: true,
            author: userCommentAuthor,
          },
        ],
      });

    expect(listEventCommentsUseCase.execute).toHaveBeenCalledWith({
      userId: 'user-1',
      userEmail: 'test@example.com',
      eventId: 'event-1',
    });
  });

  it('creates a comment for an event', async () => {
    await request(app.getHttpServer() as Server)
      .post('/events/event-1/comments')
      .send({ body: 'Comentario' })
      .expect(201)
      .expect({
        comment: {
          id: 'comment-1',
          eventId: 'event-1',
          userId: 'user-1',
          participantId: null,
          body: 'Comentario',
          createdAt: '2026-06-08T10:00:00.000Z',
          updatedAt: '2026-06-08T10:00:00.000Z',
          isOwn: true,
          author: userCommentAuthor,
        },
      });

    expect(createEventCommentUseCase.execute).toHaveBeenCalledWith({
      userId: 'user-1',
      userEmail: 'test@example.com',
      eventId: 'event-1',
      body: 'Comentario',
    });
  });

  it('maps create comment validation errors to bad request responses', async () => {
    createEventCommentUseCase.execute.mockRejectedValueOnce(
      new CreateEventCommentValidationError(
        'El comentario no puede estar vacío',
        ['body'],
      ),
    );

    await request(app.getHttpServer() as Server)
      .post('/events/event-1/comments')
      .send({ body: '' })
      .expect(400)
      .expect(({ body }: { body: { message: string; fields: string[] } }) => {
        expect(body.message).toBe('El comentario no puede estar vacío');
        expect(body.fields).toEqual(['body']);
      });
  });

  it('deletes a comment for an event', async () => {
    await request(app.getHttpServer() as Server)
      .delete('/events/event-1/comments/comment-1')
      .expect(204);

    expect(deleteEventCommentUseCase.execute).toHaveBeenCalledWith({
      userId: 'user-1',
      eventId: 'event-1',
      commentId: 'comment-1',
    });
  });

  it('maps not found errors when deleting a comment', async () => {
    deleteEventCommentUseCase.execute.mockRejectedValueOnce(
      new EventCommentNotFoundError(),
    );

    await request(app.getHttpServer() as Server)
      .delete('/events/event-1/comments/missing-comment')
      .expect(404);
  });

  it('deletes an event for the authenticated user', async () => {
    await request(app.getHttpServer() as Server)
      .delete('/events/event-1')
      .expect(204);

    expect(deleteEventUseCase.execute).toHaveBeenCalledWith({
      userId: 'user-1',
      eventId: 'event-1',
    });
  });

  it('maps not found errors when deleting an event', async () => {
    deleteEventUseCase.execute.mockRejectedValueOnce(new EventNotFoundError());

    await request(app.getHttpServer() as Server)
      .delete('/events/missing-event')
      .expect(404);
  });

  it('maps delete validation errors to bad request responses', async () => {
    deleteEventUseCase.execute.mockRejectedValueOnce(
      new DeleteEventValidationError('Evento inválido', ['eventId']),
    );

    await request(app.getHttpServer() as Server)
      .delete('/events/event-1')
      .expect(400)
      .expect(({ body }: { body: { message: string; fields: string[] } }) => {
        expect(body.message).toBe('Evento inválido');
        expect(body.fields).toEqual(['eventId']);
      });
  });
});
