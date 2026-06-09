export class ListEventsValidationError extends Error {
  constructor(
    message: string,
    public readonly fields: string[] = [],
  ) {
    super(message);
    this.name = 'ListEventsValidationError';
  }
}
