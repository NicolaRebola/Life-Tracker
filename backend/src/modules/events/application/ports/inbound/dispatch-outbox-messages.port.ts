export const DISPATCH_OUTBOX_MESSAGES = Symbol('DISPATCH_OUTBOX_MESSAGES');

export type DispatchOutboxMessagesCommand = {
  limit?: number;
};

export type DispatchOutboxMessagesResult = {
  processed: number;
  sent: number;
  failed: number;
};

export interface DispatchOutboxMessagesPort {
  execute(
    command?: DispatchOutboxMessagesCommand,
  ): Promise<DispatchOutboxMessagesResult>;
}
