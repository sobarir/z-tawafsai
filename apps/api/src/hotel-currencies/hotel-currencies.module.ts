import { Module } from '@nestjs/common';
import { HotelCurrenciesController } from './hotel-currencies.controller';
import { HotelCurrenciesService } from './hotel-currencies.service';

@Module({
  controllers: [HotelCurrenciesController],
  providers: [HotelCurrenciesService],
  exports: [HotelCurrenciesService],
})
export class HotelCurrenciesModule {}
