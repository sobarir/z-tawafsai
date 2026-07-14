import {
  createRateRuleSchema,
  rateRuleSchema,
  updateRateRuleSchema,
} from '@repo/shared';
import { createZodDto } from 'nestjs-zod';

export class RateRuleDto extends createZodDto(rateRuleSchema) {}
export class CreateRateRuleDto extends createZodDto(createRateRuleSchema) {}
export class UpdateRateRuleDto extends createZodDto(updateRateRuleSchema) {}
