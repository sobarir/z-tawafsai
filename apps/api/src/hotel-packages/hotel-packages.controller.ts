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
import type { Package } from '@repo/shared';
import {
  CreatePackageDto,
  PackageDto,
  UpdatePackageDto,
} from './hotel-packages.dto';
import { HotelPackagesService } from './hotel-packages.service';

@ApiTags('hotel-packages')
@Controller('hotel-packages')
export class HotelPackagesController {
  constructor(private readonly packages: HotelPackagesService) {}

  @Get()
  @ApiOperation({ operationId: 'listHotelPackages', summary: 'List packages' })
  @ApiOkResponse({ type: [PackageDto] })
  list(): Promise<Package[]> {
    return this.packages.list();
  }

  @Get(':packageCode')
  @ApiOperation({ operationId: 'getHotelPackage', summary: 'Get a package' })
  @ApiOkResponse({ type: PackageDto })
  get(@Param('packageCode') packageCode: string): Promise<Package> {
    return this.packages.findByCode(packageCode);
  }

  @Post()
  @ApiOperation({
    operationId: 'createHotelPackage',
    summary: 'Create a package',
  })
  @ApiCreatedResponse({ type: PackageDto })
  create(
    // Validated by the global ZodValidationPipe against createPackageSchema
    @Body() body: CreatePackageDto,
  ): Promise<Package> {
    return this.packages.create(body);
  }

  @Patch(':packageCode')
  @ApiOperation({
    operationId: 'updateHotelPackage',
    summary: 'Update a package',
  })
  @ApiOkResponse({ type: PackageDto })
  update(
    @Param('packageCode') packageCode: string,
    @Body() body: UpdatePackageDto,
  ): Promise<Package> {
    return this.packages.update(packageCode, body);
  }

  @Delete(':packageCode')
  @HttpCode(204)
  @ApiOperation({
    operationId: 'deleteHotelPackage',
    summary: 'Delete a package',
  })
  @ApiNoContentResponse()
  remove(@Param('packageCode') packageCode: string): Promise<void> {
    return this.packages.remove(packageCode);
  }
}
