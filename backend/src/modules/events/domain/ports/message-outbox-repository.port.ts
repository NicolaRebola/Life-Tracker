export const MESSAGE_OUTBOX_REPOSITORY = Symbol('MESSAGE_OUTBOX_REPOSITORY');

export type MessageFailureKind = 'TRANSIENT' | 'PERMANENT';
export type MessageOutboxStatus = 'PENDING' | 'PROCESSING' | 'SENT' | 'FAILED';

export type OutboxMessage = {
  id: string;
  channel: string;
  messageType: string;
  payload: Record<string, unknown>;
  status: MessageOutboxStatus;
  attempts: number;
  maxAttempts: number;
  availableAt: Date;
};

export type EnqueueOutboxMessage = {
  channel: string;
  messageType: string;
  payload: Record<string, unknown>;
  availableAt?: Date;
  maxAttempts?: number;
};

export interface MessageOutboxRepositoryPort {
  enqueue(message: EnqueueOutboxMessage): Promise<OutboxMessage>;
  findPendingBatch(limit: number, now: Date): Promise<OutboxMessage[]>;
  markProcessing(id: string): Promise<void>;
  markSent(id: string, providerMessageId?: string): Promise<void>;
  markFailed(command: {
    id: string;
    failureKind: MessageFailureKind;
    errorCode: string;
    message: string;
    nextAvailableAt?: Date;
  }): Promise<void>;
}
