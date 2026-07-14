import {
  createCurrencySchema,
  currencySchema,
  updateCurrencySchema,
} from '@repo/shared';
import { createZodDto } from 'nestjs-zod';

export class CurrencyDto extends createZodDto(currencySchema) {}
export class CreateCurrencyDto extends createZodDto(createCurrencySchema) {}
export class UpdateCurrencyDto extends createZodDto(updateCurrencySchema) {}
