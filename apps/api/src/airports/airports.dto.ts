import {
  airportSchema,
  createAirportSchema,
  updateAirportSchema,
} from '@repo/shared';
import { createZodDto } from 'nestjs-zod';

export class AirportDto extends createZodDto(airportSchema) {}
export class CreateAirportDto extends createZodDto(createAirportSchema) {}
export class UpdateAirportDto extends createZodDto(updateAirportSchema) {}
