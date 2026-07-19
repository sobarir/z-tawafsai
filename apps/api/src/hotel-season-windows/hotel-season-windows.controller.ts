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
import type { SeasonWindow } from '@repo/shared';
import {
  CreateSeasonWindowDto,
  SeasonWindowDto,
  UpdateSeasonWindowDto,
} from './hotel-season-windows.dto';
import { HotelSeasonWindowsService } from './hotel-season-windows.service';

@ApiTags('hotel-season-windows')
@Controller('hotel-season-windows')
export class HotelSeasonWindowsController {
  constructor(private readonly seasonWindows: HotelSeasonWindowsService) {}

  @Get()
  @ApiOperation({
    operationId: 'listHotelSeasonWindows',
    summary: 'List season windows',
  })
  @ApiOkResponse({ type: [SeasonWindowDto] })
  list(): Promise<SeasonWindow[]> {
    return this.seasonWindows.list();
  }

  @Get(':id')
  @ApiOperation({
    operationId: 'getHotelSeasonWindow',
    summary: 'Get a season window',
  })
  @ApiOkResponse({ type: SeasonWindowDto })
  get(@Param('id') id: string): Promise<SeasonWindow> {
    return this.seasonWindows.findById(id);
  }

  @Post()
  @ApiOperation({
    operationId: 'createHotelSeasonWindow',
    summary: 'Create a season window',
  })
  @ApiCreatedResponse({ type: SeasonWindowDto })
  create(
    // Validated by the global ZodValidationPipe against createSeasonWindowSchema
    @Body() body: CreateSeasonWindowDto,
  ): Promise<SeasonWindow> {
    return this.seasonWindows.create(body);
  }

  @Patch(':id')
  @ApiOperation({
    operationId: 'updateHotelSeasonWindow',
    summary: 'Update a season window',
  })
  @ApiOkResponse({ type: SeasonWindowDto })
  update(
    @Param('id') id: string,
    @Body() body: UpdateSeasonWindowDto,
  ): Promise<SeasonWindow> {
    return this.seasonWindows.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    operationId: 'deleteHotelSeasonWindow',
    summary: 'Delete a season window',
  })
  @ApiNoContentResponse()
  remove(@Param('id') id: string): Promise<void> {
    return this.seasonWindows.remove(id);
  }
}
