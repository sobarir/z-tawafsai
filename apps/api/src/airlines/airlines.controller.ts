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
import type { Airline } from '@repo/shared';
import { AirlineDto, CreateAirlineDto, UpdateAirlineDto } from './airlines.dto';
import { AirlinesService } from './airlines.service';

@ApiTags('airlines')
@Controller('airlines')
export class AirlinesController {
  constructor(private readonly airlines: AirlinesService) {}

  @Get()
  @ApiOperation({ operationId: 'listAirlines', summary: 'List airlines' })
  @ApiOkResponse({ type: [AirlineDto] })
  list(): Promise<Airline[]> {
    return this.airlines.list();
  }

  @Get(':code')
  @ApiOperation({ operationId: 'getAirline', summary: 'Get an airline' })
  @ApiOkResponse({ type: AirlineDto })
  get(@Param('code') code: string): Promise<Airline> {
    return this.airlines.findByCode(code);
  }

  @Post()
  @ApiOperation({ operationId: 'createAirline', summary: 'Create an airline' })
  @ApiCreatedResponse({ type: AirlineDto })
  create(
    // Validated by the global ZodValidationPipe against createAirlineSchema
    @Body() body: CreateAirlineDto,
  ): Promise<Airline> {
    return this.airlines.create(body);
  }

  @Patch(':code')
  @ApiOperation({ operationId: 'updateAirline', summary: 'Update an airline' })
  @ApiOkResponse({ type: AirlineDto })
  update(
    @Param('code') code: string,
    @Body() body: UpdateAirlineDto,
  ): Promise<Airline> {
    return this.airlines.update(code, body);
  }

  @Delete(':code')
  @HttpCode(204)
  @ApiOperation({ operationId: 'deleteAirline', summary: 'Delete an airline' })
  @ApiNoContentResponse()
  remove(@Param('code') code: string): Promise<void> {
    return this.airlines.remove(code);
  }
}
