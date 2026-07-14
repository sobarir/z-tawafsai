import { Module } from '@nestjs/common';
import { HotelPropertiesController } from './hotel-properties.controller';
import { HotelPropertiesService } from './hotel-properties.service';

@Module({
  controllers: [HotelPropertiesController],
  providers: [HotelPropertiesService],
  exports: [HotelPropertiesService],
})
export class HotelPropertiesModule {}
