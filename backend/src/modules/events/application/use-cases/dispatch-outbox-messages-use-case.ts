import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  MESSAGE_OUTBOX_REPOSITORY,
  type MessageOutboxRepositoryPort,
  type OutboxMessage,
} from '../../domain';
import {
  MESSAGE_CHANNEL_ADAPTER,
  type MessageChannelAdapter,
} from '../ports/outbound/message-channel-adapter.port';
import type {
  DispatchOutboxMessagesCommand,
  DispatchOutboxMessagesPort,
  DispatchOutboxMessagesResult,
} from '../ports/inbound/dispatch-outbox-messages.port';

const TRANSIENT_RETRY_DELAYS_MS = [60_000, 5 * 60_000] as const;

@Injectable()
export class DispatchOutboxMessagesUseCase implements DispatchOutboxMessagesPort {
  private readonly logger = new Logger(DispatchOutboxMessagesUseCase.name);

  constructor(
    @Inject(MESSAGE_OUTBOX_REPOSITORY)
    private readonly outboxRepository: MessageOutboxRepositoryPort,
    @Inject(MESSAGE_CHANNEL_ADAPTER)
    private readonly messageAdapter: MessageChannelAdapter,
  ) {}

  async execute(
    command: DispatchOutboxMessagesCommand = {},
  ): Promise<DispatchOutboxMessagesResult> {
    const now = new Date();
    const messages = await this.outboxRepository.findPendingBatch(
      command.limit ?? 10,
      now,
    );
    let sent = 0;
    let failed = 0;

    for (const message of messages) {
      await this.outboxRepository.markProcessing(message.id);
      const result = await this.sendMessage(message);

      if (result.ok) {
        await this.outboxRepository.markSent(
          message.id,
          result.providerMessageId,
        );
        sent += 1;
        continue;
      }

      const nextAvailableAt = this.getNextAvailableAt(
        message,
        result.failureKind,
      );
      await this.outboxRepository.markFailed({
        id: message.id,
        failureKind: result.failureKind,
        errorCode: result.errorCode,
        message: result.message,
        nextAvailableAt,
      });

      if (!nextAvailableAt) {
        failed += 1;
      }
    }

    return {
      processed: messages.length,
      sent,
      failed,
    };
  }

  private getNextAvailableAt(
    message: OutboxMessage,
    failureKind: 'PERMANENT' | 'TRANSIENT',
  ) {
    if (failureKind === 'PERMANENT') {
      return undefined;
    }

    const nextAttemptNumber = message.attempts + 1;
    if (nextAttemptNumber >= message.maxAttempts) {
      return undefined;
    }

    const delay = TRANSIENT_RETRY_DELAYS_MS[nextAttemptNumber - 1];
    return delay ? new Date(Date.now() + delay) : undefined;
  }

  private async sendMessage(message: OutboxMessage) {
    try {
      return await this.messageAdapter.send(message);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Unknown message adapter error';
      this.logger.error(
        `Message adapter failed for outbox message ${message.id}: ${errorMessage}`,
      );

      return {
        ok: false as const,
        failureKind: 'TRANSIENT' as const,
        errorCode: 'message_adapter_error',
        message: errorMessage,
      };
    }
  }
}
