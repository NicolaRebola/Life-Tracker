import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Server } from 'http';
import request from 'supertest';
import { OutboxDispatchController } from 'src/modules/events/delivery/outbox-dispatch.controller';
import { DISPATCH_OUTBOX_MESSAGES } from 'src/modules/events/application/ports/inbound/dispatch-outbox-messages.port';
import { InternalJobGuard } from 'src/modules/events/application/internal-job.guard';

describe('OutboxDispatchController (integration)', () => {
  const originalEnv = process.env;
  let app: INestApplication;
  let dispatchOutboxMessagesUseCase: { execute: jest.Mock };

  beforeEach(async () => {
    process.env = {
      ...originalEnv,
      OUTBOX_DISPATCH_SECRET: 'test-secret',
    };
    dispatchOutboxMessagesUseCase = {
      execute: jest.fn().mockResolvedValue({
        processed: 1,
        sent: 1,
        failed: 0,
      }),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [OutboxDispatchController],
      providers: [
        InternalJobGuard,
        {
          provide: DISPATCH_OUTBOX_MESSAGES,
          useValue: dispatchOutboxMessagesUseCase,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    process.env = originalEnv;
    await app.close();
  });

  it('rejects requests without the internal job secret', async () => {
    await request(app.getHttpServer() as Server)
      .post('/internal/outbox/dispatch')
      .send({ limit: 10 })
      .expect(401);

    expect(dispatchOutboxMessagesUseCase.execute).not.toHaveBeenCalled();
  });

  it('dispatches pending outbox messages with a valid secret', async () => {
    await request(app.getHttpServer() as Server)
      .post('/internal/outbox/dispatch')
      .set('X-Internal-Job-Secret', 'test-secret')
      .send({ limit: 25 })
      .expect(200)
      .expect({
        processed: 1,
        sent: 1,
        failed: 0,
      });

    expect(dispatchOutboxMessagesUseCase.execute).toHaveBeenCalledWith({
      limit: 25,
    });
  });

  it('rejects invalid dispatch limits', async () => {
    await request(app.getHttpServer() as Server)
      .post('/internal/outbox/dispatch')
      .set('X-Internal-Job-Secret', 'test-secret')
      .send({ limit: 0 })
      .expect(400);

    expect(dispatchOutboxMessagesUseCase.execute).not.toHaveBeenCalled();
  });
});
