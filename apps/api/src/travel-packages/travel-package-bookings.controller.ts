import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { TravelPackageBooking } from '@repo/shared';
import {
  CreateTravelPackageBookingDto,
  TravelPackageBookingDto,
  UpdateTravelPackageBookingDto,
} from './travel-packages.dto';
import { TravelPackagesService } from './travel-packages.service';

// Back-office seat-inventory management. Every route requires a session (the
// global AuthGuard) — booking rows carry customer PII and must never surface on
// the anonymous public package list.
@ApiTags('travel-package-bookings')
@Controller('travel-package-bookings')
export class TravelPackageBookingsController {
  constructor(private readonly travelPackages: TravelPackagesService) {}

  @Get()
  @ApiOperation({
    operationId: 'listTravelPackageBookings',
    summary: 'List bookings for a departure',
  })
  @ApiOkResponse({ type: [TravelPackageBookingDto] })
  list(
    @Query('departureId') departureId: string,
  ): Promise<TravelPackageBooking[]> {
    return this.travelPackages.listBookings(departureId);
  }

  @Post()
  @ApiOperation({
    operationId: 'createTravelPackageBooking',
    summary: 'Create a booking against a departure',
  })
  @ApiCreatedResponse({ type: TravelPackageBookingDto })
  create(
    @Body() body: CreateTravelPackageBookingDto,
  ): Promise<TravelPackageBooking> {
    return this.travelPackages.createBooking(body);
  }

  @Patch(':id')
  @ApiOperation({
    operationId: 'updateTravelPackageBooking',
    summary: 'Update a booking',
  })
  @ApiOkResponse({ type: TravelPackageBookingDto })
  update(
    @Param('id') id: string,
    @Body() body: UpdateTravelPackageBookingDto,
  ): Promise<TravelPackageBooking> {
    return this.travelPackages.updateBooking(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    operationId: 'deleteTravelPackageBooking',
    summary: 'Delete a booking',
  })
  @ApiNoContentResponse()
  remove(@Param('id') id: string): Promise<void> {
    return this.travelPackages.removeBooking(id);
  }
}
