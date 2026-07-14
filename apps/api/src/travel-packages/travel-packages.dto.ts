import {
  createFlightHotelPackageSchema,
  flightHotelPackageSchema,
  updateFlightHotelPackageSchema,
} from '@repo/shared';
import { createZodDto } from 'nestjs-zod';

export class TravelPackageDto extends createZodDto(flightHotelPackageSchema) {}
export class CreateTravelPackageDto extends createZodDto(
  createFlightHotelPackageSchema,
) {}
export class UpdateTravelPackageDto extends createZodDto(
  updateFlightHotelPackageSchema,
) {}
