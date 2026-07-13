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
  CreateFlightInput,
  CreateFlightLegInput,
  Flight,
  FlightLeg,
  SearchFlightsQuery,
  UpdateFlightInput,
} from '@repo/shared';
import { and, asc, eq, gte, inArray, lt } from 'drizzle-orm';
import { DATABASE } from '../database/database.module';

type FlightRow = typeof schema.flights.$inferSelect;
type FlightLegRow = typeof schema.flightLegs.$inferSelect;

const toFlightLeg = (row: FlightLegRow): FlightLeg => ({
  ...row,
  departureTime: row.departureTime.toISOString(),
  arrivalTime: row.arrivalTime.toISOString(),
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

function groupLegsByFlight(
  legRows: FlightLegRow[],
): Map<string, FlightLegRow[]> {
  const legsByFlight = new Map<string, FlightLegRow[]>();
  for (const leg of legRows) {
    const existing = legsByFlight.get(leg.flightId);
    if (existing) {
      existing.push(leg);
    } else {
      legsByFlight.set(leg.flightId, [leg]);
    }
  }
  return legsByFlight;
}

const toFlight = (row: FlightRow, legRows: FlightLegRow[]): Flight => ({
  ...row,
  departureTime: row.departureTime.toISOString(),
  arrivalTime: row.arrivalTime.toISOString(),
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
  legs: legRows.map(toFlightLeg),
});

/**
 * Derives the ordered legs to insert for a new flight, enforcing the
 * invariants from /prd/flights/11-data-model.md Entity 4: no legs given -> one FULL
 * leg spanning the flight's own route; legs given -> first leg departs the
 * flight origin, last leg arrives the flight destination, and legs are
 * contiguous (leg[n].arrAirport == leg[n+1].depAirport).
 */
export function buildFlightLegs(
  input: CreateFlightInput,
): CreateFlightLegInput[] {
  if (!input.legs) {
    return [
      {
        role: 'FULL',
        depAirport: input.originAirport,
        arrAirport: input.destAirport,
        departureTime: input.departureTime,
        arrivalTime: input.arrivalTime,
      },
    ];
  }

  const legs = input.legs;
  const first = legs[0];
  const last = legs[legs.length - 1];

  if (first.depAirport !== input.originAirport) {
    throw new BadRequestException(
      `First leg must depart from the flight's origin airport (${input.originAirport}), got ${first.depAirport}`,
    );
  }
  if (last.arrAirport !== input.destAirport) {
    throw new BadRequestException(
      `Last leg must arrive at the flight's destination airport (${input.destAirport}), got ${last.arrAirport}`,
    );
  }
  for (let i = 0; i < legs.length - 1; i++) {
    if (legs[i].arrAirport !== legs[i + 1].depAirport) {
      throw new BadRequestException(
        `Leg ${i + 1} arrives at ${legs[i].arrAirport} but leg ${i + 2} departs from ${legs[i + 1].depAirport} — legs must be contiguous`,
      );
    }
  }

  return legs;
}

@Injectable()
export class FlightsService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async list(): Promise<Flight[]> {
    const rows = await this.db
      .select()
      .from(schema.flights)
      .orderBy(asc(schema.flights.departureTime));
    if (rows.length === 0) {
      return [];
    }
    const legRows = await this.db
      .select()
      .from(schema.flightLegs)
      .orderBy(asc(schema.flightLegs.legSequence));
    const legsByFlight = groupLegsByFlight(legRows);
    return rows.map((row) => toFlight(row, legsByFlight.get(row.id) ?? []));
  }

  /**
   * OTA-style route+date search — ACTIVE flights only, sorted cheapest first.
   * `date` is matched against the UTC calendar day of `departureTime` (a
   * documented v1.1 simplification, not per-airport local day; see
   * /prd/flights/00-overview.md Goal 7).
   */
  async search(query: SearchFlightsQuery): Promise<Flight[]> {
    const dayStart = new Date(`${query.date}T00:00:00.000Z`);
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

    const rows = await this.db
      .select()
      .from(schema.flights)
      .where(
        and(
          eq(schema.flights.originAirport, query.originAirport),
          eq(schema.flights.destAirport, query.destAirport),
          eq(schema.flights.status, 'ACTIVE'),
          gte(schema.flights.departureTime, dayStart),
          lt(schema.flights.departureTime, dayEnd),
        ),
      )
      .orderBy(asc(schema.flights.price));
    if (rows.length === 0) {
      return [];
    }
    const legRows = await this.db
      .select()
      .from(schema.flightLegs)
      .where(
        inArray(
          schema.flightLegs.flightId,
          rows.map((row) => row.id),
        ),
      )
      .orderBy(asc(schema.flightLegs.legSequence));
    const legsByFlight = groupLegsByFlight(legRows);
    return rows.map((row) => toFlight(row, legsByFlight.get(row.id) ?? []));
  }

  async findById(id: string): Promise<Flight> {
    const [row] = await this.db
      .select()
      .from(schema.flights)
      .where(eq(schema.flights.id, id));
    if (!row) {
      throw new NotFoundException(`Flight ${id} not found`);
    }
    const legRows = await this.db
      .select()
      .from(schema.flightLegs)
      .where(eq(schema.flightLegs.flightId, id))
      .orderBy(asc(schema.flightLegs.legSequence));
    return toFlight(row, legRows);
  }

  async create(input: CreateFlightInput): Promise<Flight> {
    const legs = buildFlightLegs(input);

    const [existing] = await this.db
      .select({ id: schema.flights.id })
      .from(schema.flights)
      .where(
        and(
          eq(schema.flights.operatingAirline, input.operatingAirline),
          eq(schema.flights.flightNumber, input.flightNumber),
          eq(schema.flights.departureTime, new Date(input.departureTime)),
        ),
      );
    if (existing) {
      throw new ConflictException(
        `Flight ${input.operatingAirline}${input.flightNumber} at ${input.departureTime} already exists`,
      );
    }

    return this.db.transaction(async (tx) => {
      const [flight] = await tx
        .insert(schema.flights)
        .values({
          operatingAirline: input.operatingAirline,
          flightNumber: input.flightNumber,
          originAirport: input.originAirport,
          destAirport: input.destAirport,
          departureTime: new Date(input.departureTime),
          arrivalTime: new Date(input.arrivalTime),
          aircraftType: input.aircraftType,
          status: input.status,
          price: input.price,
          currency: input.currency,
        })
        .returning();

      const legRows = await tx
        .insert(schema.flightLegs)
        .values(
          legs.map((leg, index) => ({
            flightId: flight.id,
            legSequence: index + 1,
            role: leg.role,
            depAirport: leg.depAirport,
            arrAirport: leg.arrAirport,
            departureTime: new Date(leg.departureTime),
            arrivalTime: new Date(leg.arrivalTime),
          })),
        )
        .returning();

      return toFlight(flight, legRows);
    });
  }

  async update(id: string, input: UpdateFlightInput): Promise<Flight> {
    await this.findById(id);
    const [updated] = await this.db
      .update(schema.flights)
      .set(input)
      .where(eq(schema.flights.id, id))
      .returning();
    const legRows = await this.db
      .select()
      .from(schema.flightLegs)
      .where(eq(schema.flightLegs.flightId, id))
      .orderBy(asc(schema.flightLegs.legSequence));
    return toFlight(updated, legRows);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.db.delete(schema.flights).where(eq(schema.flights.id, id));
  }
}
