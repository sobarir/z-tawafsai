import { Module } from '@nestjs/common';
import { TravelPackageBookingsController } from './travel-package-bookings.controller';
import { TravelPackagesController } from './travel-packages.controller';
import { TravelPackagesService } from './travel-packages.service';

@Module({
  controllers: [TravelPackagesController, TravelPackageBookingsController],
  providers: [TravelPackagesService],
  exports: [TravelPackagesService],
})
export class TravelPackagesModule {}
