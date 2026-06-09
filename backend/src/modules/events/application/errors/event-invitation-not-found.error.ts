export class EventInvitationNotFoundError extends Error {
  constructor(message = 'Invitación no encontrada') {
    super(message);
    this.name = 'EventInvitationNotFoundError';
  }
}
