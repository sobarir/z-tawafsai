import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Database } from '@repo/db';
import { schema } from '@repo/db';
import type {
  CreateFlightMarketingInput,
  Flight,
  FlightMarketing,
  UpdateFlightMarketingInput,
} from '@repo/shared';
import { and, eq } from 'drizzle-orm';
import { DATABASE } from '../database/database.module';
import { FlightsService } from '../flights/flights.service';

type FlightMarketingRow = typeof schema.flightMarketing.$inferSelect;

const toFlightMarketing = (row: FlightMarketingRow): FlightMarketing => ({
  ...row,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

@Injectable()
export class FlightMarketingService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly flights: FlightsService,
  ) {}

  async list(flightId?: string): Promise<FlightMarketing[]> {
    const rows = flightId
      ? await this.db
          .select()
          .from(schema.flightMarketing)
          .where(eq(schema.flightMarketing.flightId, flightId))
      : await this.db.select().from(schema.flightMarketing);
    return rows.map(toFlightMarketing);
  }

  async findById(id: string): Promise<FlightMarketing> {
    const [row] = await this.db
      .select()
      .from(schema.flightMarketing)
      .where(eq(schema.flightMarketing.id, id));
    if (!row) {
      throw new NotFoundException(`Flight marketing row ${id} not found`);
    }
    return toFlightMarketing(row);
  }

  async create(input: CreateFlightMarketingInput): Promise<FlightMarketing> {
    const flight = await this.flights.findById(input.flightId);
    await this.assertOperatingCarrierInvariant(
      flight,
      input.flightId,
      input.isOperatingCarrier ?? false,
      input.marketingAirline,
    );

    const [existing] = await this.db
      .select({ id: schema.flightMarketing.id })
      .from(schema.flightMarketing)
      .where(
        and(
          eq(schema.flightMarketing.marketingAirline, input.marketingAirline),
          eq(schema.flightMarketing.marketingNumber, input.marketingNumber),
          eq(schema.flightMarketing.flightId, input.flightId),
        ),
      );
    if (existing) {
      throw new ConflictException(
        `Marketing flight ${input.marketingAirline}${input.marketingNumber} already exists for flight ${input.flightId}`,
      );
    }

    const [created] = await this.db
      .insert(schema.flightMarketing)
      .values(input)
      .returning();
    return toFlightMarketing(created);
  }

  async update(
    id: string,
    input: UpdateFlightMarketingInput,
  ): Promise<FlightMarketing> {
    const existing = await this.findById(id);
    if (input.isOperatingCarrier) {
      const flight = await this.flights.findById(existing.flightId);
      await this.assertOperatingCarrierInvariant(
        flight,
        existing.flightId,
        true,
        existing.marketingAirline,
        id,
      );
    }
    const [updated] = await this.db
      .update(schema.flightMarketing)
      .set(input)
      .where(eq(schema.flightMarketing.id, id))
      .returning();
    return toFlightMarketing(updated);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.db
      .delete(schema.flightMarketing)
      .where(eq(schema.flightMarketing.id, id));
  }

  /** operationId: getOperatingFlightByMarketing */
  async resolveOperatingFlight(
    marketingAirline: string,
    marketingNumber: string,
  ): Promise<Flight> {
    const [row] = await this.db
      .select()
      .from(schema.flightMarketing)
      .where(
        and(
          eq(schema.flightMarketing.marketingAirline, marketingAirline),
          eq(schema.flightMarketing.marketingNumber, marketingNumber),
        ),
      );
    if (!row) {
      throw new NotFoundException(
        `No flight marketed as ${marketingAirline}${marketingNumber}`,
      );
    }
    return this.flights.findById(row.flightId);
  }

  /**
   * The row where is_operating_carrier=true must carry the flight's own
   * operating airline, and at most one such
   * row may exist per flight (backed by the DB partial unique index).
   */
  private async assertOperatingCarrierInvariant(
    flight: Flight,
    flightId: string,
    isOperatingCarrier: boolean,
    marketingAirline: string,
    excludeId?: string,
  ): Promise<void> {
    if (!isOperatingCarrier) {
      return;
    }
    if (marketingAirline !== flight.operatingAirline) {
      throw new BadRequestException(
        `The operating-carrier marketing row's airline (${marketingAirline}) must match the flight's operating airline (${flight.operatingAirline})`,
      );
    }
    const [existingOperating] = await this.db
      .select({ id: schema.flightMarketing.id })
      .from(schema.flightMarketing)
      .where(
        and(
          eq(schema.flightMarketing.flightId, flightId),
          eq(schema.flightMarketing.isOperatingCarrier, true),
        ),
      );
    if (existingOperating && existingOperating.id !== excludeId) {
      throw new ConflictException(
        `Flight ${flightId} already has an operating-carrier marketing row`,
      );
    }
  }
}
