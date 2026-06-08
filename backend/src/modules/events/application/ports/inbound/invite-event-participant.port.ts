export const INVITE_EVENT_PARTICIPANT = Symbol('INVITE_EVENT_PARTICIPANT');

export type InviteEventParticipantCommand = {
  userId: string;
  eventId: string;
  email: string;
};

export type InviteEventParticipantResult = {
  invitation: {
    id: string;
    eventId: string;
    invitedEmail: string;
    channel: 'EMAIL';
    status: 'PENDING';
    expiresAt: string;
  };
};

export interface InviteEventParticipantPort {
  execute(
    command: InviteEventParticipantCommand,
  ): Promise<InviteEventParticipantResult>;
}
