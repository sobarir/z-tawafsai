import { Module } from '@nestjs/common';
import { HotelRateRulesController } from './hotel-rate-rules.controller';
import { HotelRateRulesService } from './hotel-rate-rules.service';

@Module({
  controllers: [HotelRateRulesController],
  providers: [HotelRateRulesService],
  exports: [HotelRateRulesService],
})
export class HotelRateRulesModule {}
