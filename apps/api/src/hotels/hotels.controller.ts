import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { HotelSearchResponse } from '@repo/shared';
import { HotelSearchResponseDto, SearchHotelsDto } from './hotels.dto';
import { HotelsService } from './hotels.service';

@ApiTags('hotels')
@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotels: HotelsService) {}

  @Get('search')
  @ApiOperation({
    operationId: 'searchHotels',
    summary:
      'Search hotel properties by destination/dates/occupancy, priced in the requested display currency',
  })
  @ApiOkResponse({ type: HotelSearchResponseDto })
  search(
    // Validated by the global ZodValidationPipe against hotelSearchQuerySchema
    @Query() query: SearchHotelsDto,
  ): Promise<HotelSearchResponse> {
    return this.hotels.search(query);
  }
}
