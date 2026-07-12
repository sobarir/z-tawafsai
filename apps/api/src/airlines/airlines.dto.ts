import {
  airlineSchema,
  createAirlineSchema,
  updateAirlineSchema,
} from '@repo/shared';
import { createZodDto } from 'nestjs-zod';

export class AirlineDto extends createZodDto(airlineSchema) {}
export class CreateAirlineDto extends createZodDto(createAirlineSchema) {}
export class UpdateAirlineDto extends createZodDto(updateAirlineSchema) {}
