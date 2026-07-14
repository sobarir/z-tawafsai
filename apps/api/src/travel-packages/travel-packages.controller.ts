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
import type { FlightHotelPackage } from '@repo/shared';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import {
  CreateTravelPackageDto,
  TravelPackageDto,
  UpdateTravelPackageDto,
} from './travel-packages.dto';
import { TravelPackagesService } from './travel-packages.service';

@ApiTags('travel-packages')
@Controller('travel-packages')
export class TravelPackagesController {
  constructor(private readonly travelPackages: TravelPackagesService) {}

  @Get()
  @AllowAnonymous()
  @ApiOperation({
    operationId: 'listTravelPackages',
    summary: 'List travel packages',
  })
  @ApiOkResponse({ type: [TravelPackageDto] })
  list(): Promise<FlightHotelPackage[]> {
    return this.travelPackages.list();
  }

  @Get(':id')
  @AllowAnonymous()
  @ApiOperation({
    operationId: 'getTravelPackage',
    summary: 'Get a travel package',
  })
  @ApiOkResponse({ type: TravelPackageDto })
  get(@Param('id') id: string): Promise<FlightHotelPackage> {
    return this.travelPackages.findById(id);
  }

  @Post()
  @ApiOperation({
    operationId: 'createTravelPackage',
    summary: 'Create a travel package',
  })
  @ApiCreatedResponse({ type: TravelPackageDto })
  create(
    // Validated by the global ZodValidationPipe against createFlightHotelPackageSchema
    @Body() body: CreateTravelPackageDto,
  ): Promise<FlightHotelPackage> {
    return this.travelPackages.create(body);
  }

  @Patch(':id')
  @ApiOperation({
    operationId: 'updateTravelPackage',
    summary: 'Update a travel package',
  })
  @ApiOkResponse({ type: TravelPackageDto })
  update(
    @Param('id') id: string,
    @Body() body: UpdateTravelPackageDto,
  ): Promise<FlightHotelPackage> {
    return this.travelPackages.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    operationId: 'deleteTravelPackage',
    summary: 'Delete a travel package',
  })
  @ApiNoContentResponse()
  remove(@Param('id') id: string): Promise<void> {
    return this.travelPackages.remove(id);
  }
}
