import { meResponseSchema } from '@repo/shared';
import { createZodDto } from 'nestjs-zod';

export class MeResponseDto extends createZodDto(meResponseSchema) {}
