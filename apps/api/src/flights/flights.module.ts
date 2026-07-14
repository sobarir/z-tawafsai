import { forwardRef, Module } from '@nestjs/common';
import { ConnectionsModule } from '../connections/connections.module';
import { FlightsController } from './flights.controller';
import { FlightsService } from './flights.service';

@Module({
  imports: [forwardRef(() => ConnectionsModule)],
  controllers: [FlightsController],
  providers: [FlightsService],
  exports: [FlightsService],
})
export class FlightsModule {}
