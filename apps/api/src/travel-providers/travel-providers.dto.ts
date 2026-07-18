import {
  createTravelProviderSchema,
  travelProviderSchema,
  updateTravelProviderSchema,
} from '@repo/shared';
import { createZodDto } from 'nestjs-zod';

export class TravelProviderDto extends createZodDto(travelProviderSchema) {}
export class CreateTravelProviderDto extends createZodDto(
  createTravelProviderSchema,
) {}
export class UpdateTravelProviderDto extends createZodDto(
  updateTravelProviderSchema,
) {}
