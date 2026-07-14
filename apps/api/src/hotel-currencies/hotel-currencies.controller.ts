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
import type { Currency } from '@repo/shared';
import {
  CreateCurrencyDto,
  CurrencyDto,
  UpdateCurrencyDto,
} from './hotel-currencies.dto';
import { HotelCurrenciesService } from './hotel-currencies.service';

@ApiTags('hotel-currencies')
@Controller('hotel-currencies')
export class HotelCurrenciesController {
  constructor(private readonly currencies: HotelCurrenciesService) {}

  @Get()
  @ApiOperation({
    operationId: 'listHotelCurrencies',
    summary: 'List currencies',
  })
  @ApiOkResponse({ type: [CurrencyDto] })
  list(): Promise<Currency[]> {
    return this.currencies.list();
  }

  @Get(':code')
  @ApiOperation({ operationId: 'getHotelCurrency', summary: 'Get a currency' })
  @ApiOkResponse({ type: CurrencyDto })
  get(@Param('code') code: string): Promise<Currency> {
    return this.currencies.findByCode(code);
  }

  @Post()
  @ApiOperation({
    operationId: 'createHotelCurrency',
    summary: 'Create a currency',
  })
  @ApiCreatedResponse({ type: CurrencyDto })
  create(
    // Validated by the global ZodValidationPipe against createCurrencySchema
    @Body() body: CreateCurrencyDto,
  ): Promise<Currency> {
    return this.currencies.create(body);
  }

  @Patch(':code')
  @ApiOperation({
    operationId: 'updateHotelCurrency',
    summary: 'Update a currency',
  })
  @ApiOkResponse({ type: CurrencyDto })
  update(
    @Param('code') code: string,
    @Body() body: UpdateCurrencyDto,
  ): Promise<Currency> {
    return this.currencies.update(code, body);
  }

  @Delete(':code')
  @HttpCode(204)
  @ApiOperation({
    operationId: 'deleteHotelCurrency',
    summary: 'Delete a currency',
  })
  @ApiNoContentResponse()
  remove(@Param('code') code: string): Promise<void> {
    return this.currencies.remove(code);
  }
}
