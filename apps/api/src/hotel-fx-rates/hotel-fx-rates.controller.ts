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
import type { FxRate } from '@repo/shared';
import {
  CreateFxRateDto,
  FxRateDto,
  UpdateFxRateDto,
} from './hotel-fx-rates.dto';
import { HotelFxRatesService } from './hotel-fx-rates.service';

@ApiTags('hotel-fx-rates')
@Controller('hotel-fx-rates')
export class HotelFxRatesController {
  constructor(private readonly fxRates: HotelFxRatesService) {}

  @Get()
  @ApiOperation({ operationId: 'listHotelFxRates', summary: 'List FX rates' })
  @ApiOkResponse({ type: [FxRateDto] })
  list(): Promise<FxRate[]> {
    return this.fxRates.list();
  }

  @Get(':id')
  @ApiOperation({ operationId: 'getHotelFxRate', summary: 'Get an FX rate' })
  @ApiOkResponse({ type: FxRateDto })
  get(@Param('id') id: string): Promise<FxRate> {
    return this.fxRates.findById(id);
  }

  @Post()
  @ApiOperation({
    operationId: 'createHotelFxRate',
    summary: 'Create an FX rate',
  })
  @ApiCreatedResponse({ type: FxRateDto })
  create(
    // Validated by the global ZodValidationPipe against createFxRateSchema
    @Body() body: CreateFxRateDto,
  ): Promise<FxRate> {
    return this.fxRates.create(body);
  }

  @Patch(':id')
  @ApiOperation({
    operationId: 'updateHotelFxRate',
    summary: 'Update an FX rate',
  })
  @ApiOkResponse({ type: FxRateDto })
  update(
    @Param('id') id: string,
    @Body() body: UpdateFxRateDto,
  ): Promise<FxRate> {
    return this.fxRates.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    operationId: 'deleteHotelFxRate',
    summary: 'Delete an FX rate',
  })
  @ApiNoContentResponse()
  remove(@Param('id') id: string): Promise<void> {
    return this.fxRates.remove(id);
  }
}
