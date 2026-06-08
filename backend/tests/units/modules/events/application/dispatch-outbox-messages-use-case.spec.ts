import { DispatchOutboxMessagesUseCase } from 'src/modules/events/application/use-cases/dispatch-outbox-messages-use-case';
import type {
  MessageOutboxRepositoryPort,
  OutboxMessage,
} from 'src/modules/events/domain';
import type { MessageChannelAdapter } from 'src/modules/events/application/ports/outbound/message-channel-adapter.port';

type MarkFailedCommand = Parameters<
  MessageOutboxRepositoryPort['markFailed']
>[0];

describe('DispatchOutboxMessagesUseCase', () => {
  let outboxRepository: MessageOutboxRepositoryPort;
  let messageAdapter: MessageChannelAdapter;
  let message: OutboxMessage;
  let findPendingBatch: jest.Mock;
  let markProcessing: jest.Mock;
  let markSent: jest.Mock;
  let markFailed: jest.Mock<Promise<void>, [MarkFailedCommand]>;

  beforeEach(() => {
    message = {
      id: 'message-1',
      channel: 'EMAIL',
      messageType: 'EVENT_INVITATION',
      payload: {},
      status: 'PENDING',
      attempts: 0,
      maxAttempts: 3,
      availableAt: new Date('2026-06-08T10:00:00.000Z'),
    };

    findPendingBatch = jest.fn().mockResolvedValue([message]);
    markProcessing = jest.fn().mockResolvedValue(undefined);
    markSent = jest.fn().mockResolvedValue(undefined);
    markFailed = jest
      .fn<Promise<void>, [MarkFailedCommand]>()
      .mockResolvedValue(undefined);
    outboxRepository = {
      enqueue: jest.fn(),
      findPendingBatch,
      markProcessing,
      markSent,
      markFailed,
    };
    messageAdapter = {
      send: jest.fn().mockResolvedValue({
        ok: true,
        providerMessageId: 'provider-message-1',
      }),
    };
  });

  it('marks processed messages as sent when the adapter succeeds', async () => {
    const result = await new DispatchOutboxMessagesUseCase(
      outboxRepository,
      messageAdapter,
    ).execute({ limit: 5 });

    expect(findPendingBatch).toHaveBeenCalledWith(5, expect.any(Date));
    expect(markProcessing).toHaveBeenCalledWith('message-1');
    expect(markSent).toHaveBeenCalledWith('message-1', 'provider-message-1');
    expect(result).toEqual({
      processed: 1,
      sent: 1,
      failed: 0,
    });
  });

  it('marks thrown adapter errors as transient failures for retry', async () => {
    messageAdapter.send = jest
      .fn()
      .mockRejectedValue(new Error('Network down'));

    const result = await new DispatchOutboxMessagesUseCase(
      outboxRepository,
      messageAdapter,
    ).execute();

    expect(markFailed).toHaveBeenCalledTimes(1);
    const failure = markFailed.mock.calls[0][0];
    expect(failure).toMatchObject({
      id: 'message-1',
      failureKind: 'TRANSIENT',
      errorCode: 'message_adapter_error',
      message: 'Network down',
    });
    expect(failure.nextAvailableAt).toBeInstanceOf(Date);
    expect(result).toEqual({
      processed: 1,
      sent: 0,
      failed: 0,
    });
  });
});
