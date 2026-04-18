export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly metadata?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'DomainError';
  }
}
