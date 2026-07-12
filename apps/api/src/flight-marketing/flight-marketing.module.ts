import { Module } from '@nestjs/common';
import { FlightsModule } from '../flights/flights.module';
import { FlightMarketingController } from './flight-marketing.controller';
import { FlightMarketingService } from './flight-marketing.service';

@Module({
  imports: [FlightsModule],
  controllers: [FlightMarketingController],
  providers: [FlightMarketingService],
})
export class FlightMarketingModule {}
