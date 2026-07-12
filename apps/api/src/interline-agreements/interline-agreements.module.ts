import { Module } from '@nestjs/common';
import { InterlineAgreementsController } from './interline-agreements.controller';
import { InterlineAgreementsService } from './interline-agreements.service';

@Module({
  controllers: [InterlineAgreementsController],
  providers: [InterlineAgreementsService],
  exports: [InterlineAgreementsService],
})
export class InterlineAgreementsModule {}
