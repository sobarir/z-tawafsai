import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Database } from '@repo/db';
import { schema } from '@repo/db';
import type {
  CreateRoomTypeInput,
  RoomType,
  UpdateRoomTypeInput,
} from '@repo/shared';
import { and, asc, eq } from 'drizzle-orm';
import { DATABASE } from '../database/database.module';

type RoomTypeRow = typeof schema.roomType.$inferSelect;

const toRoomType = (row: RoomTypeRow): RoomType => ({ ...row });

@Injectable()
export class HotelRoomTypesService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async list(): Promise<RoomType[]> {
    const rows = await this.db
      .select()
      .from(schema.roomType)
      .orderBy(asc(schema.roomType.propertyCode), asc(schema.roomType.name));
    return rows.map(toRoomType);
  }

  async findById(id: string): Promise<RoomType> {
    const [row] = await this.db
      .select()
      .from(schema.roomType)
      .where(eq(schema.roomType.id, id));
    if (!row) {
      throw new NotFoundException(`Room type ${id} not found`);
    }
    return toRoomType(row);
  }

  async create(input: CreateRoomTypeInput): Promise<RoomType> {
    const [existing] = await this.db
      .select({ id: schema.roomType.id })
      .from(schema.roomType)
      .where(
        and(
          eq(schema.roomType.propertyCode, input.propertyCode),
          eq(schema.roomType.name, input.name),
        ),
      );
    if (existing) {
      throw new ConflictException(
        `Room type "${input.name}" already exists for property ${input.propertyCode}`,
      );
    }
    const [created] = await this.db
      .insert(schema.roomType)
      .values(input)
      .returning();
    return toRoomType(created);
  }

  async update(id: string, input: UpdateRoomTypeInput): Promise<RoomType> {
    await this.findById(id);
    const [updated] = await this.db
      .update(schema.roomType)
      .set(input)
      .where(eq(schema.roomType.id, id))
      .returning();
    return toRoomType(updated);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.db.delete(schema.roomType).where(eq(schema.roomType.id, id));
  }
}
