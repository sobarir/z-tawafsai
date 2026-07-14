import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { RateRule } from '@repo/shared';
import {
  CreateRateRuleDto,
  RateRuleDto,
  UpdateRateRuleDto,
} from './hotel-rate-rules.dto';
import { HotelRateRulesService } from './hotel-rate-rules.service';

@ApiTags('hotel-rate-rules')
@Controller('hotel-rate-rules')
export class HotelRateRulesController {
  constructor(private readonly rateRules: HotelRateRulesService) {}

  @Get()
  @ApiOperation({
    operationId: 'listHotelRateRules',
    summary: 'List rate rules',
  })
  @ApiOkResponse({ type: [RateRuleDto] })
  list(): Promise<RateRule[]> {
    return this.rateRules.list();
  }

  @Get(':id')
  @ApiOperation({ operationId: 'getHotelRateRule', summary: 'Get a rate rule' })
  @ApiOkResponse({ type: RateRuleDto })
  get(@Param('id') id: string): Promise<RateRule> {
    return this.rateRules.findById(id);
  }

  @Post()
  @ApiOperation({
    operationId: 'createHotelRateRule',
    summary: 'Create a rate rule',
  })
  @ApiCreatedResponse({ type: RateRuleDto })
  create(
    // Validated by the global ZodValidationPipe against createRateRuleSchema
    @Body() body: CreateRateRuleDto,
  ): Promise<RateRule> {
    return this.rateRules.create(body);
  }

  @Patch(':id')
  @ApiOperation({
    operationId: 'updateHotelRateRule',
    summary: 'Update a rate rule',
  })
  @ApiOkResponse({ type: RateRuleDto })
  update(
    @Param('id') id: string,
    @Body() body: UpdateRateRuleDto,
  ): Promise<RateRule> {
    return this.rateRules.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    operationId: 'deleteHotelRateRule',
    summary: 'Delete a rate rule',
  })
  @ApiNoContentResponse()
  remove(@Param('id') id: string): Promise<void> {
    return this.rateRules.remove(id);
  }
}
