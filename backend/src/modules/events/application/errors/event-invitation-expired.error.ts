export class EventInvitationExpiredError extends Error {
  constructor(message = 'La invitación expiró') {
    super(message);
    this.name = 'EventInvitationExpiredError';
  }
}
