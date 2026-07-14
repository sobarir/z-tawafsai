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
import type { Property } from '@repo/shared';
import {
  CreatePropertyDto,
  PropertyDto,
  UpdatePropertyDto,
} from './hotel-properties.dto';
import { HotelPropertiesService } from './hotel-properties.service';

@ApiTags('hotel-properties')
@Controller('hotel-properties')
export class HotelPropertiesController {
  constructor(private readonly properties: HotelPropertiesService) {}

  @Get()
  @ApiOperation({
    operationId: 'listHotelProperties',
    summary: 'List properties',
  })
  @ApiOkResponse({ type: [PropertyDto] })
  list(): Promise<Property[]> {
    return this.properties.list();
  }

  @Get(':propertyCode')
  @ApiOperation({ operationId: 'getHotelProperty', summary: 'Get a property' })
  @ApiOkResponse({ type: PropertyDto })
  get(@Param('propertyCode') propertyCode: string): Promise<Property> {
    return this.properties.findByCode(propertyCode);
  }

  @Post()
  @ApiOperation({
    operationId: 'createHotelProperty',
    summary: 'Create a property',
  })
  @ApiCreatedResponse({ type: PropertyDto })
  create(
    // Validated by the global ZodValidationPipe against createPropertySchema
    @Body() body: CreatePropertyDto,
  ): Promise<Property> {
    return this.properties.create(body);
  }

  @Patch(':propertyCode')
  @ApiOperation({
    operationId: 'updateHotelProperty',
    summary: 'Update a property',
  })
  @ApiOkResponse({ type: PropertyDto })
  update(
    @Param('propertyCode') propertyCode: string,
    @Body() body: UpdatePropertyDto,
  ): Promise<Property> {
    return this.properties.update(propertyCode, body);
  }

  @Delete(':propertyCode')
  @HttpCode(204)
  @ApiOperation({
    operationId: 'deleteHotelProperty',
    summary: 'Delete a property',
  })
  @ApiNoContentResponse()
  remove(@Param('propertyCode') propertyCode: string): Promise<void> {
    return this.properties.remove(propertyCode);
  }
}
