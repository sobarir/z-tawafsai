import {
  createMctRuleSchema,
  mctRuleSchema,
  resolveMctRuleQuerySchema,
  updateMctRuleSchema,
} from '@repo/shared';
import { createZodDto } from 'nestjs-zod';

export class MctRuleDto extends createZodDto(mctRuleSchema) {}
export class CreateMctRuleDto extends createZodDto(createMctRuleSchema) {}
export class UpdateMctRuleDto extends createZodDto(updateMctRuleSchema) {}
export class ResolveMctRuleDto extends createZodDto(
  resolveMctRuleQuerySchema,
) {}
