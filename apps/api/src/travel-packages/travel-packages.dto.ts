import {
  createFlightHotelPackageSchema,
  createTravelPackageBookingSchema,
  flightHotelPackageSchema,
  travelPackageBookingSchema,
  travelPackageEarningsRowSchema,
  updateFlightHotelPackageSchema,
  updateTravelPackageBookingSchema,
} from '@repo/shared';
import { createZodDto } from 'nestjs-zod';

export class TravelPackageDto extends createZodDto(flightHotelPackageSchema) {}
export class CreateTravelPackageDto extends createZodDto(
  createFlightHotelPackageSchema,
) {}
export class UpdateTravelPackageDto extends createZodDto(
  updateFlightHotelPackageSchema,
) {}

export class TravelPackageBookingDto extends createZodDto(
  travelPackageBookingSchema,
) {}
export class CreateTravelPackageBookingDto extends createZodDto(
  createTravelPackageBookingSchema,
) {}
export class UpdateTravelPackageBookingDto extends createZodDto(
  updateTravelPackageBookingSchema,
) {}

export class TravelPackageEarningsRowDto extends createZodDto(
  travelPackageEarningsRowSchema,
) {}
