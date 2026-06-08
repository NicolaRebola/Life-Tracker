export class UpdateEventCommentValidationError extends Error {
  constructor(
    message: string,
    public readonly fields: string[],
  ) {
    super(message);
    this.name = 'UpdateEventCommentValidationError';
  }
}
