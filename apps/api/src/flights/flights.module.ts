import { Module } from '@nestjs/common';
import { ConnectionValidatorService } from './connection-validator.service';
import { FlightsController } from './flights.controller';
import { FlightsService } from './flights.service';

@Module({
  imports: [],
  controllers: [FlightsController],
  providers: [FlightsService, ConnectionValidatorService],
  exports: [FlightsService],
})
export class FlightsModule {}
