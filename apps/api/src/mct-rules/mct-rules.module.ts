import { Module } from '@nestjs/common';
import { MctRulesController } from './mct-rules.controller';
import { MctRulesService } from './mct-rules.service';

@Module({
  controllers: [MctRulesController],
  providers: [MctRulesService],
  exports: [MctRulesService],
})
export class MctRulesModule {}
