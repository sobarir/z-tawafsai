import {
  createFlightMarketingSchema,
  flightMarketingSchema,
  updateFlightMarketingSchema,
} from '@repo/shared';
import { createZodDto } from 'nestjs-zod';

export class FlightMarketingDto extends createZodDto(flightMarketingSchema) {}
export class CreateFlightMarketingDto extends createZodDto(
  createFlightMarketingSchema,
) {}
export class UpdateFlightMarketingDto extends createZodDto(
  updateFlightMarketingSchema,
) {}
