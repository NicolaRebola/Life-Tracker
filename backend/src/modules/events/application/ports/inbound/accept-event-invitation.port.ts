export const ACCEPT_EVENT_INVITATION = Symbol('ACCEPT_EVENT_INVITATION');

export type AcceptEventInvitationCommand = {
  token: string;
  displayName?: string | null;
};

export type AcceptEventInvitationResult = {
  participantSessionToken: string;
  expiresAt: string;
  participant: {
    id: string;
    eventId: string;
    email: string;
    displayName: string | null;
  };
};

export interface AcceptEventInvitationPort {
  execute(
    command: AcceptEventInvitationCommand,
  ): Promise<AcceptEventInvitationResult>;
}
