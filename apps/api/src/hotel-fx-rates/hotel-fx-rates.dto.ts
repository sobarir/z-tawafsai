import {
  createFxRateSchema,
  fxRateSchema,
  updateFxRateSchema,
} from '@repo/shared';
import { createZodDto } from 'nestjs-zod';

export class FxRateDto extends createZodDto(fxRateSchema) {}
export class CreateFxRateDto extends createZodDto(createFxRateSchema) {}
export class UpdateFxRateDto extends createZodDto(updateFxRateSchema) {}
