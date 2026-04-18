import { DomainError } from '@src/shared/domain/errors/domain-error';
import { Money } from '@src/shared/domain/value-objects/money.value-object';

describe('Money', () => {
  it('creates a valid money value object', () => {
    const money = Money.create(1500, 'brl');
    expect(money.amount).toBe(1500);
    expect(money.currency).toBe('BRL');
  });

  it('throws for negative amount', () => {
    expect(() => Money.create(-1, 'BRL')).toThrow(DomainError);
  });
});
