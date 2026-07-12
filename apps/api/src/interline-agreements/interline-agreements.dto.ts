import {
  createInterlineAgreementSchema,
  interlineAgreementSchema,
  interlineResolutionSchema,
  resolveInterlineQuerySchema,
} from '@repo/shared';
import { createZodDto } from 'nestjs-zod';

export class InterlineAgreementDto extends createZodDto(
  interlineAgreementSchema,
) {}
export class CreateInterlineAgreementDto extends createZodDto(
  createInterlineAgreementSchema,
) {}
export class ResolveInterlineDto extends createZodDto(
  resolveInterlineQuerySchema,
) {}
export class InterlineResolutionDto extends createZodDto(
  interlineResolutionSchema,
) {}
