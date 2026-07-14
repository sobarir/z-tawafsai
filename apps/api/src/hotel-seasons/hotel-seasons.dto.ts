import {
  createSeasonSchema,
  seasonSchema,
  updateSeasonSchema,
} from '@repo/shared';
import { createZodDto } from 'nestjs-zod';

export class SeasonDto extends createZodDto(seasonSchema) {}
export class CreateSeasonDto extends createZodDto(createSeasonSchema) {}
export class UpdateSeasonDto extends createZodDto(updateSeasonSchema) {}
