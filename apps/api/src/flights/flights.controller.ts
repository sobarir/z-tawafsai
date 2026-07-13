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
  ApiTags,
} from '@nestjs/swagger';
import type { Flight } from '@repo/shared';
import {
  CreateFlightDto,
  FlightDto,
  SearchFlightsDto,
  UpdateFlightDto,
} from './flights.dto';
import { FlightsService } from './flights.service';

@ApiTags('flights')
@Controller('flights')
export class FlightsController {
  constructor(private readonly flights: FlightsService) {}

  @Get()
  @ApiOperation({ operationId: 'listFlights', summary: 'List flights' })
  @ApiOkResponse({ type: [FlightDto] })
  list(): Promise<Flight[]> {
    return this.flights.list();
  }

  @Get('search')
  @ApiOperation({
    operationId: 'searchFlights',
    summary: 'OTA-style flight search by route and date, sorted by price',
  })
  @ApiOkResponse({ type: [FlightDto] })
  search(
    // Validated by the global ZodValidationPipe against searchFlightsQuerySchema
    @Query() query: SearchFlightsDto,
  ): Promise<Flight[]> {
    return this.flights.search(query);
  }

  @Get(':id')
  @ApiOperation({ operationId: 'getFlight', summary: 'Get a flight' })
  @ApiOkResponse({ type: FlightDto })
  get(@Param('id') id: string): Promise<Flight> {
    return this.flights.findById(id);
  }

  @Post()
  @ApiOperation({ operationId: 'createFlight', summary: 'Create a flight' })
  @ApiCreatedResponse({ type: FlightDto })
  create(
    // Validated by the global ZodValidationPipe against createFlightSchema
    @Body() body: CreateFlightDto,
  ): Promise<Flight> {
    return this.flights.create(body);
  }

  @Patch(':id')
  @ApiOperation({ operationId: 'updateFlight', summary: 'Update a flight' })
  @ApiOkResponse({ type: FlightDto })
  update(
    @Param('id') id: string,
    @Body() body: UpdateFlightDto,
  ): Promise<Flight> {
    return this.flights.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ operationId: 'deleteFlight', summary: 'Delete a flight' })
  @ApiNoContentResponse()
  remove(@Param('id') id: string): Promise<void> {
    return this.flights.remove(id);
  }
}
