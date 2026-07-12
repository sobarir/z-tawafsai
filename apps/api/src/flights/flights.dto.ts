import {
  createFlightSchema,
  flightSchema,
  updateFlightSchema,
} from '@repo/shared';
import { createZodDto } from 'nestjs-zod';

export class FlightDto extends createZodDto(flightSchema) {}
export class CreateFlightDto extends createZodDto(createFlightSchema) {}
export class UpdateFlightDto extends createZodDto(updateFlightSchema) {}
