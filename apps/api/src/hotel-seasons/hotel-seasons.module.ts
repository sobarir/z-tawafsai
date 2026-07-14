import { Module } from '@nestjs/common';
import { HotelSeasonsController } from './hotel-seasons.controller';
import { HotelSeasonsService } from './hotel-seasons.service';

@Module({
  controllers: [HotelSeasonsController],
  providers: [HotelSeasonsService],
  exports: [HotelSeasonsService],
})
export class HotelSeasonsModule {}
