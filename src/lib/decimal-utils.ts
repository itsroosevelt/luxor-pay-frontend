import Decimal from 'decimal.js';

export function toDecimal(value: number | string | Decimal): Decimal {
  return value instanceof Decimal ? value : new Decimal(value);
}

export function sumAmounts(values: Array<number | string>): Decimal {
  return values.reduce<Decimal>((total, value) => total.plus(value), new Decimal(0));
}

export function formatDecimalAmount(amount: Decimal | number | string, decimals: number): string {
  return toDecimal(amount).toFixed(decimals);
}
