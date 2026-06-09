export class EventParticipantNotFoundError extends Error {
  constructor(message = 'Participante no encontrado') {
    super(message);
    this.name = 'EventParticipantNotFoundError';
  }
}
