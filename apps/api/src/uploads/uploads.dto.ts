import { uploadResultSchema } from '@repo/shared';
import { createZodDto } from 'nestjs-zod';

export class UploadResultDto extends createZodDto(uploadResultSchema) {}
