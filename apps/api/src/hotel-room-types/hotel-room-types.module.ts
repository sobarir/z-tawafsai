import { Module } from '@nestjs/common';
import { HotelRoomTypesController } from './hotel-room-types.controller';
import { HotelRoomTypesService } from './hotel-room-types.service';

@Module({
  controllers: [HotelRoomTypesController],
  providers: [HotelRoomTypesService],
  exports: [HotelRoomTypesService],
})
export class HotelRoomTypesModule {}
