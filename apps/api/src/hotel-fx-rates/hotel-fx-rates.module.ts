import { Module } from '@nestjs/common';
import { HotelFxRatesController } from './hotel-fx-rates.controller';
import { HotelFxRatesService } from './hotel-fx-rates.service';

@Module({
  controllers: [HotelFxRatesController],
  providers: [HotelFxRatesService],
  exports: [HotelFxRatesService],
})
export class HotelFxRatesModule {}
