export const MESSAGE_CHANNEL_ADAPTER = Symbol('MESSAGE_CHANNEL_ADAPTER');

export type MessageSendResult =
  | { ok: true; providerMessageId?: string }
  | {
      ok: false;
      failureKind: 'PERMANENT' | 'TRANSIENT';
      errorCode: string;
      message: string;
    };

export type SendableMessage = {
  id: string;
  channel: string;
  messageType: string;
  payload: Record<string, unknown>;
};

export interface MessageChannelAdapter {
  send(message: SendableMessage): Promise<MessageSendResult>;
}
