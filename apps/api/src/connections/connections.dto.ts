import {
  connectionResultSchema,
  validateConnectionChainSchema,
  validateConnectionSchema,
} from '@repo/shared';
import { createZodDto } from 'nestjs-zod';

export class ValidateConnectionDto extends createZodDto(
  validateConnectionSchema,
) {}
export class ValidateConnectionChainDto extends createZodDto(
  validateConnectionChainSchema,
) {}
export class ConnectionResultDto extends createZodDto(connectionResultSchema) {}
