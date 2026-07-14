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
import type { City } from '@repo/shared';
import { CityDto, CreateCityDto, UpdateCityDto } from './cities.dto';
import { CitiesService } from './cities.service';

@ApiTags('cities')
@Controller('cities')
export class CitiesController {
  constructor(private readonly cities: CitiesService) {}

  @Get()
  @ApiOperation({ operationId: 'listCities', summary: 'List cities' })
  @ApiOkResponse({ type: [CityDto] })
  list(): Promise<City[]> {
    return this.cities.list();
  }

  @Get(':code')
  @ApiOperation({ operationId: 'getCity', summary: 'Get a city' })
  @ApiOkResponse({ type: CityDto })
  get(@Param('code') code: string): Promise<City> {
    return this.cities.findByCode(code);
  }

  @Post()
  @ApiOperation({ operationId: 'createCity', summary: 'Create a city' })
  @ApiCreatedResponse({ type: CityDto })
  create(
    // Validated by the global ZodValidationPipe against createCitySchema
    @Body() body: CreateCityDto,
  ): Promise<City> {
    return this.cities.create(body);
  }

  @Patch(':code')
  @ApiOperation({ operationId: 'updateCity', summary: 'Update a city' })
  @ApiOkResponse({ type: CityDto })
  update(
    @Param('code') code: string,
    @Body() body: UpdateCityDto,
  ): Promise<City> {
    return this.cities.update(code, body);
  }

  @Delete(':code')
  @HttpCode(204)
  @ApiOperation({ operationId: 'deleteCity', summary: 'Delete a city' })
  @ApiNoContentResponse()
  remove(@Param('code') code: string): Promise<void> {
    return this.cities.remove(code);
  }
}
