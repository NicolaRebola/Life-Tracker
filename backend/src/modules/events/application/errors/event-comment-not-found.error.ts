export class EventCommentNotFoundError extends Error {
  constructor(message = 'Comentario no encontrado') {
    super(message);
    this.name = 'EventCommentNotFoundError';
  }
}
