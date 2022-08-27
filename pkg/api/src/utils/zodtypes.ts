import Decimal from 'decimal.js';
import z, { Schema } from 'zod';

export const decimal = (): Schema<Decimal> =>
  z
    .instanceof(Decimal)
    .or(z.string())
    .or(z.number())
    .transform((value) => {
      try {
        return new Decimal(value);
      } catch (error) {
        return undefined;
      }
    })
    .refine((value): value is Decimal => value instanceof Decimal);
