import {
  createSeasonWindowSchema,
  seasonWindowSchema,
  updateSeasonWindowSchema,
} from '@repo/shared';
import { createZodDto } from 'nestjs-zod';

export class SeasonWindowDto extends createZodDto(seasonWindowSchema) {}
export class CreateSeasonWindowDto extends createZodDto(
  createSeasonWindowSchema,
) {}
export class UpdateSeasonWindowDto extends createZodDto(
  updateSeasonWindowSchema,
) {}
