import {
  hotelSearchQuerySchema,
  hotelSearchResponseSchema,
} from '@repo/shared';
import { createZodDto } from 'nestjs-zod';

export class SearchHotelsDto extends createZodDto(hotelSearchQuerySchema) {}
export class HotelSearchResponseDto extends createZodDto(
  hotelSearchResponseSchema,
) {}
