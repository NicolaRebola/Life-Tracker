import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Server } from 'http';
import request from 'supertest';
import { EventController } from 'src/modules/events/delivery/event.controller';
import { CREATE_EVENT } from 'src/modules/events/application/ports/inbound/create-event.port';
import { CreateEventValidationError } from 'src/modules/events/application/errors/create-event-validation.error';
import {
  AuthenticatedRequest,
  SessionGuard,
} from 'src/modules/session/application/session.guard';

describe('EventController (integration)', () => {
  let app: INestApplication;
  let createEventUseCase: { execute: jest.Mock };

  beforeEach(async () => {
    createEventUseCase = {
      execute: jest.fn().mockResolvedValue({ id: 'event-1' }),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [
        {
          provide: CREATE_EVENT,
          useValue: createEventUseCase,
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
    await app.close();
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
});
