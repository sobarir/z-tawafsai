import {
  createRoomTypeSchema,
  roomTypeSchema,
  updateRoomTypeSchema,
} from '@repo/shared';
import { createZodDto } from 'nestjs-zod';

export class RoomTypeDto extends createZodDto(roomTypeSchema) {}
export class CreateRoomTypeDto extends createZodDto(createRoomTypeSchema) {}
export class UpdateRoomTypeDto extends createZodDto(updateRoomTypeSchema) {}
