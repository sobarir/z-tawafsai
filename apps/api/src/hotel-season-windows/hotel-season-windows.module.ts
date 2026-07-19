import { Module } from '@nestjs/common';
import { HotelSeasonWindowsController } from './hotel-season-windows.controller';
import { HotelSeasonWindowsService } from './hotel-season-windows.service';

@Module({
  controllers: [HotelSeasonWindowsController],
  providers: [HotelSeasonWindowsService],
  exports: [HotelSeasonWindowsService],
})
export class HotelSeasonWindowsModule {}
