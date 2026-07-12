import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { InterlineAgreement, InterlineResolution } from '@repo/shared';
import {
  CreateInterlineAgreementDto,
  InterlineAgreementDto,
  InterlineResolutionDto,
  ResolveInterlineDto,
} from './interline-agreements.dto';
import { InterlineAgreementsService } from './interline-agreements.service';

@ApiTags('interline-agreements')
@Controller('interline-agreements')
export class InterlineAgreementsController {
  constructor(
    private readonly interlineAgreements: InterlineAgreementsService,
  ) {}

  @Get()
  @ApiOperation({
    operationId: 'listInterlineAgreements',
    summary: 'List interline agreements',
  })
  @ApiOkResponse({ type: [InterlineAgreementDto] })
  list(): Promise<InterlineAgreement[]> {
    return this.interlineAgreements.list();
  }

  @Get('resolve')
  @ApiOperation({
    operationId: 'resolveInterline',
    summary: 'Resolve the directional interline gate for a carrier pair',
  })
  @ApiOkResponse({ type: InterlineResolutionDto })
  resolve(
    // Validated by the global ZodValidationPipe against resolveInterlineQuerySchema
    @Query() query: ResolveInterlineDto,
  ): Promise<InterlineResolution> {
    return this.interlineAgreements.resolveInterline(
      query.inboundAirline,
      query.outboundAirline,
    );
  }

  @Get(':id')
  @ApiOperation({
    operationId: 'getInterlineAgreement',
    summary: 'Get an interline agreement',
  })
  @ApiOkResponse({ type: InterlineAgreementDto })
  get(@Param('id') id: string): Promise<InterlineAgreement> {
    return this.interlineAgreements.findById(id);
  }

  @Post()
  @ApiOperation({
    operationId: 'createInterlineAgreement',
    summary: 'Create an interline agreement',
  })
  @ApiCreatedResponse({ type: InterlineAgreementDto })
  create(
    // Validated by the global ZodValidationPipe against createInterlineAgreementSchema
    @Body() body: CreateInterlineAgreementDto,
  ): Promise<InterlineAgreement> {
    return this.interlineAgreements.create(body);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    operationId: 'deleteInterlineAgreement',
    summary: 'Delete an interline agreement',
  })
  @ApiNoContentResponse()
  remove(@Param('id') id: string): Promise<void> {
    return this.interlineAgreements.remove(id);
  }
}
