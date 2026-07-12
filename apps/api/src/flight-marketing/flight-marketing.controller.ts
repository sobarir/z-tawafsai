import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { Flight, FlightMarketing } from '@repo/shared';
import { FlightDto } from '../flights/flights.dto';
import {
  CreateFlightMarketingDto,
  FlightMarketingDto,
  UpdateFlightMarketingDto,
} from './flight-marketing.dto';
import { FlightMarketingService } from './flight-marketing.service';

@ApiTags('flight-marketing')
@Controller('flight-marketing')
export class FlightMarketingController {
  constructor(private readonly flightMarketing: FlightMarketingService) {}

  @Get()
  @ApiOperation({
    operationId: 'listFlightMarketing',
    summary: 'List marketing flights',
  })
  @ApiQuery({ name: 'flightId', required: false })
  @ApiOkResponse({ type: [FlightMarketingDto] })
  list(@Query('flightId') flightId?: string): Promise<FlightMarketing[]> {
    return this.flightMarketing.list(flightId);
  }

  @Get('resolve')
  @ApiOperation({
    operationId: 'getOperatingFlightByMarketing',
    summary: 'Resolve a marketing flight to its operating flight',
  })
  @ApiQuery({ name: 'marketingAirline', required: true })
  @ApiQuery({ name: 'marketingNumber', required: true })
  @ApiOkResponse({ type: FlightDto })
  resolve(
    @Query('marketingAirline') marketingAirline: string,
    @Query('marketingNumber') marketingNumber: string,
  ): Promise<Flight> {
    return this.flightMarketing.resolveOperatingFlight(
      marketingAirline,
      marketingNumber,
    );
  }

  @Get(':id')
  @ApiOperation({
    operationId: 'getFlightMarketing',
    summary: 'Get a marketing flight',
  })
  @ApiOkResponse({ type: FlightMarketingDto })
  get(@Param('id') id: string): Promise<FlightMarketing> {
    return this.flightMarketing.findById(id);
  }

  @Post()
  @ApiOperation({
    operationId: 'createFlightMarketing',
    summary: 'Create a marketing flight',
  })
  @ApiCreatedResponse({ type: FlightMarketingDto })
  create(
    // Validated by the global ZodValidationPipe against createFlightMarketingSchema
    @Body() body: CreateFlightMarketingDto,
  ): Promise<FlightMarketing> {
    return this.flightMarketing.create(body);
  }

  @Patch(':id')
  @ApiOperation({
    operationId: 'updateFlightMarketing',
    summary: 'Update a marketing flight',
  })
  @ApiOkResponse({ type: FlightMarketingDto })
  update(
    @Param('id') id: string,
    @Body() body: UpdateFlightMarketingDto,
  ): Promise<FlightMarketing> {
    return this.flightMarketing.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    operationId: 'deleteFlightMarketing',
    summary: 'Delete a marketing flight',
  })
  @ApiNoContentResponse()
  remove(@Param('id') id: string): Promise<void> {
    return this.flightMarketing.remove(id);
  }
}
