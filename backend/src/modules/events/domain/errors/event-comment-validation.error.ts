export class EventCommentValidationError extends Error {
  constructor(
    message: string,
    public readonly fields: string[],
  ) {
    super(message);
    this.name = 'EventCommentValidationError';
  }
}
