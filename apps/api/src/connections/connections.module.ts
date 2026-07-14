import { forwardRef, Module } from '@nestjs/common';
import { AirportsModule } from '../airports/airports.module';
import { FlightsModule } from '../flights/flights.module';
import { InterlineAgreementsModule } from '../interline-agreements/interline-agreements.module';
import { MctRulesModule } from '../mct-rules/mct-rules.module';
import { ConnectionsController } from './connections.controller';
import { ConnectionsService } from './connections.service';

@Module({
  imports: [
    forwardRef(() => FlightsModule),
    AirportsModule,
    MctRulesModule,
    InterlineAgreementsModule,
  ],
  controllers: [ConnectionsController],
  providers: [ConnectionsService],
  exports: [ConnectionsService],
})
export class ConnectionsModule {}
