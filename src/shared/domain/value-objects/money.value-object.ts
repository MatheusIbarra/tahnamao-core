import { DomainError } from '../errors/domain-error';

export class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: string,
  ) {}

  static create(amount: number, currency: string): Money {
    if (!Number.isFinite(amount) || amount < 0) {
      throw new DomainError('Amount must be a non-negative finite number.', 'INVALID_AMOUNT');
    }

    if (!currency || currency.trim().length !== 3) {
      throw new DomainError('Currency must be a 3-letter code.', 'INVALID_CURRENCY');
    }

    return new Money(amount, currency.toUpperCase());
  }
}
