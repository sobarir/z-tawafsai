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
import type { RoomType } from '@repo/shared';
import {
  CreateRoomTypeDto,
  RoomTypeDto,
  UpdateRoomTypeDto,
} from './hotel-room-types.dto';
import { HotelRoomTypesService } from './hotel-room-types.service';

@ApiTags('hotel-room-types')
@Controller('hotel-room-types')
export class HotelRoomTypesController {
  constructor(private readonly roomTypes: HotelRoomTypesService) {}

  @Get()
  @ApiOperation({
    operationId: 'listHotelRoomTypes',
    summary: 'List room types',
  })
  @ApiOkResponse({ type: [RoomTypeDto] })
  list(): Promise<RoomType[]> {
    return this.roomTypes.list();
  }

  @Get(':id')
  @ApiOperation({ operationId: 'getHotelRoomType', summary: 'Get a room type' })
  @ApiOkResponse({ type: RoomTypeDto })
  get(@Param('id') id: string): Promise<RoomType> {
    return this.roomTypes.findById(id);
  }

  @Post()
  @ApiOperation({
    operationId: 'createHotelRoomType',
    summary: 'Create a room type',
  })
  @ApiCreatedResponse({ type: RoomTypeDto })
  create(
    // Validated by the global ZodValidationPipe against createRoomTypeSchema
    @Body() body: CreateRoomTypeDto,
  ): Promise<RoomType> {
    return this.roomTypes.create(body);
  }

  @Patch(':id')
  @ApiOperation({
    operationId: 'updateHotelRoomType',
    summary: 'Update a room type',
  })
  @ApiOkResponse({ type: RoomTypeDto })
  update(
    @Param('id') id: string,
    @Body() body: UpdateRoomTypeDto,
  ): Promise<RoomType> {
    return this.roomTypes.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    operationId: 'deleteHotelRoomType',
    summary: 'Delete a room type',
  })
  @ApiNoContentResponse()
  remove(@Param('id') id: string): Promise<void> {
    return this.roomTypes.remove(id);
  }
}
