export class EventCommentForbiddenError extends Error {
  constructor(message = 'No tienes permiso para modificar este comentario') {
    super(message);
    this.name = 'EventCommentForbiddenError';
  }
}
