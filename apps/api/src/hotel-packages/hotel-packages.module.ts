import { Module } from '@nestjs/common';
import { HotelPackagesController } from './hotel-packages.controller';
import { HotelPackagesService } from './hotel-packages.service';

@Module({
  controllers: [HotelPackagesController],
  providers: [HotelPackagesService],
  exports: [HotelPackagesService],
})
export class HotelPackagesModule {}
