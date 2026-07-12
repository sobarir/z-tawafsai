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
import type { Airport } from '@repo/shared';
import { AirportDto, CreateAirportDto, UpdateAirportDto } from './airports.dto';
import { AirportsService } from './airports.service';

@ApiTags('airports')
@Controller('airports')
export class AirportsController {
  constructor(private readonly airports: AirportsService) {}

  @Get()
  @ApiOperation({ operationId: 'listAirports', summary: 'List airports' })
  @ApiOkResponse({ type: [AirportDto] })
  list(): Promise<Airport[]> {
    return this.airports.list();
  }

  @Get(':code')
  @ApiOperation({ operationId: 'getAirport', summary: 'Get an airport' })
  @ApiOkResponse({ type: AirportDto })
  get(@Param('code') code: string): Promise<Airport> {
    return this.airports.findByCode(code);
  }

  @Post()
  @ApiOperation({ operationId: 'createAirport', summary: 'Create an airport' })
  @ApiCreatedResponse({ type: AirportDto })
  create(
    // Validated by the global ZodValidationPipe against createAirportSchema
    @Body() body: CreateAirportDto,
  ): Promise<Airport> {
    return this.airports.create(body);
  }

  @Patch(':code')
  @ApiOperation({ operationId: 'updateAirport', summary: 'Update an airport' })
  @ApiOkResponse({ type: AirportDto })
  update(
    @Param('code') code: string,
    @Body() body: UpdateAirportDto,
  ): Promise<Airport> {
    return this.airports.update(code, body);
  }

  @Delete(':code')
  @HttpCode(204)
  @ApiOperation({ operationId: 'deleteAirport', summary: 'Delete an airport' })
  @ApiNoContentResponse()
  remove(@Param('code') code: string): Promise<void> {
    return this.airports.remove(code);
  }
}
