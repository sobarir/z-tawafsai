import { Module } from '@nestjs/common';
import { TravelProvidersController } from './travel-providers.controller';
import { TravelProvidersService } from './travel-providers.service';

@Module({
  controllers: [TravelProvidersController],
  providers: [TravelProvidersService],
  exports: [TravelProvidersService],
})
export class TravelProvidersModule {}
