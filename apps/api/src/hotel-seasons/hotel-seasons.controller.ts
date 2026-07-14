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
import type { Season } from '@repo/shared';
import {
  CreateSeasonDto,
  SeasonDto,
  UpdateSeasonDto,
} from './hotel-seasons.dto';
import { HotelSeasonsService } from './hotel-seasons.service';

@ApiTags('hotel-seasons')
@Controller('hotel-seasons')
export class HotelSeasonsController {
  constructor(private readonly seasons: HotelSeasonsService) {}

  @Get()
  @ApiOperation({ operationId: 'listHotelSeasons', summary: 'List seasons' })
  @ApiOkResponse({ type: [SeasonDto] })
  list(): Promise<Season[]> {
    return this.seasons.list();
  }

  @Get(':id')
  @ApiOperation({ operationId: 'getHotelSeason', summary: 'Get a season' })
  @ApiOkResponse({ type: SeasonDto })
  get(@Param('id') id: string): Promise<Season> {
    return this.seasons.findById(id);
  }

  @Post()
  @ApiOperation({
    operationId: 'createHotelSeason',
    summary: 'Create a season',
  })
  @ApiCreatedResponse({ type: SeasonDto })
  create(
    // Validated by the global ZodValidationPipe against createSeasonSchema
    @Body() body: CreateSeasonDto,
  ): Promise<Season> {
    return this.seasons.create(body);
  }

  @Patch(':id')
  @ApiOperation({
    operationId: 'updateHotelSeason',
    summary: 'Update a season',
  })
  @ApiOkResponse({ type: SeasonDto })
  update(
    @Param('id') id: string,
    @Body() body: UpdateSeasonDto,
  ): Promise<Season> {
    return this.seasons.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    operationId: 'deleteHotelSeason',
    summary: 'Delete a season',
  })
  @ApiNoContentResponse()
  remove(@Param('id') id: string): Promise<void> {
    return this.seasons.remove(id);
  }
}
