export const GET_EVENT_INVITATION = Symbol('GET_EVENT_INVITATION');

export type GetEventInvitationCommand = {
  token: string;
};

export type GetEventInvitationResult = {
  invitation: {
    eventId: string;
    status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
    expiresAt: string;
    invitedUserExists: boolean;
  };
};

export interface GetEventInvitationPort {
  execute(command: GetEventInvitationCommand): Promise<GetEventInvitationResult>;
}
