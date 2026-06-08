import { Injectable } from '@nestjs/common';
import type {
  CreateInvitationMessageCommand,
  InvitationChannelStrategy,
  InvitationMessage,
} from '../../application/ports/outbound/invitation-channel-strategy.port';

@Injectable()
export class EmailInvitationStrategy implements InvitationChannelStrategy {
  readonly channel = 'EMAIL' as const;

  createMessage(command: CreateInvitationMessageCommand): InvitationMessage {
    return {
      channel: this.channel,
      messageType: 'EVENT_INVITATION',
      payload: {
        to: command.to,
        subject: `Invitación a ${command.eventName}`,
        template: 'event-invitation',
        variables: {
          eventId: command.eventId,
          eventName: command.eventName,
          invitedByName: command.invitedByName,
          invitationUrl: command.invitationUrl,
          expiresAt: command.expiresAt.toISOString(),
        },
      },
    };
  }
}
