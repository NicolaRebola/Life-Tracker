export class EventNotFoundError extends Error {
  constructor() {
    super('Evento no encontrado');
    this.name = 'EventNotFoundError';
  }
}
