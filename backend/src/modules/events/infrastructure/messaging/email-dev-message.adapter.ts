import { Injectable, Logger } from '@nestjs/common';
import type {
  MessageChannelAdapter,
  MessageSendResult,
  SendableMessage,
} from '../../application/ports/outbound/message-channel-adapter.port';

@Injectable()
export class EmailDevMessageAdapter implements MessageChannelAdapter {
  private readonly logger = new Logger(EmailDevMessageAdapter.name);

  send(message: SendableMessage): Promise<MessageSendResult> {
    const variables =
      typeof message.payload.variables === 'object' &&
      message.payload.variables !== null
        ? (message.payload.variables as Record<string, unknown>)
        : {};
    const invitationUrl =
      typeof variables.invitationUrl === 'string'
        ? variables.invitationUrl
        : '';

    this.logger.log(
      `Dev email queued for ${String(message.payload.to)}: ${invitationUrl}`,
    );

    return Promise.resolve({
      ok: true,
      providerMessageId: `dev_${message.id}`,
    });
  }
}
