export const INVITATION_CHANNEL_STRATEGY = Symbol(
  'INVITATION_CHANNEL_STRATEGY',
);

export type InvitationChannel = 'EMAIL';

export type CreateInvitationMessageCommand = {
  channel: InvitationChannel;
  to: string;
  eventId: string;
  eventName: string;
  invitedByName: string;
  invitationUrl: string;
  expiresAt: Date;
};

export type InvitationMessage = {
  channel: InvitationChannel;
  messageType: 'EVENT_INVITATION';
  payload: Record<string, unknown>;
};

export interface InvitationChannelStrategy {
  readonly channel: InvitationChannel;
  createMessage(command: CreateInvitationMessageCommand): InvitationMessage;
}
