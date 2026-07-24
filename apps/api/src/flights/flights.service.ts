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
  FlightItinerary,
  FlightLeg,
  SearchFlightsQuery,
  UpdateFlightInput,
} from '@repo/shared';
import { and, asc, eq, inArray } from 'drizzle-orm';
import { DATABASE } from '../database/database.module';
import { ConnectionValidatorService } from './connection-validator.service';
import { journeyDurationMinutes } from './journey-duration';

type FlightRow = typeof schema.flights.$inferSelect;
type FlightLegRow = typeof schema.flightLegs.$inferSelect;

const toFlightLeg = (row: FlightLegRow): FlightLeg => ({
  ...row,
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
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
  legs: legRows.map(toFlightLeg),
});

/**
 * Derives the ordered legs to insert for a flight, enforcing the flight-leg
 * invariants: no legs given -> none stored, because a nonstop flight's route
 * and times already live on the flight row and a leg spanning it would be a
 * stored copy of derived data; legs given -> first leg departs the flight
 * origin, last leg arrives the flight destination, and legs are sequentially
 * connected.
 */
/** The header fields buildFlightLegs reads — satisfied by both create and update inputs. */
type FlightLegSource = Pick<
  CreateFlightInput,
  | 'originAirport'
  | 'destAirport'
  | 'departureTimeLocal'
  | 'arrivalTimeLocal'
  | 'arrivalDayOffset'
  | 'legs'
>;

export function buildFlightLegs(
  input: FlightLegSource,
): CreateFlightLegInput[] {
  if (!input.legs || input.legs.length === 0) {
    return [];
  }

  const firstLeg = input.legs[0];
  const lastLeg = input.legs[input.legs.length - 1];

  if (firstLeg?.depAirport !== input.originAirport) {
    throw new BadRequestException(
      `First leg departure (${firstLeg?.depAirport}) must match flight origin (${input.originAirport})`,
    );
  }
  if (lastLeg?.arrAirport !== input.destAirport) {
    throw new BadRequestException(
      `Last leg arrival (${lastLeg?.arrAirport}) must match flight destination (${input.destAirport})`,
    );
  }

  for (let i = 0; i < input.legs.length - 1; i++) {
    const current = input.legs[i];
    const next = input.legs[i + 1];
    if (current?.arrAirport !== next?.depAirport) {
      throw new BadRequestException(
        `Leg ${i + 1} arrives at ${current?.arrAirport} but leg ${i + 2} departs from ${next?.depAirport}`,
      );
    }
  }

  return input.legs;
}

@Injectable()
export class FlightsService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly connectionValidator: ConnectionValidatorService,
  ) {}

  private async attachLegs(rows: FlightRow[]): Promise<Flight[]> {
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

  async list(): Promise<Flight[]> {
    const rows = await this.db
      .select()
      .from(schema.flights)
      .orderBy(asc(schema.flights.departureTimeLocal));
    return this.attachLegs(rows);
  }

  /**
   * Search for Master Schedule Flights.
   */
  async search(query: SearchFlightsQuery): Promise<FlightItinerary[]> {
    const { originAirport, destAirport } = query;

    let originAirports: string[] = [];
    if (originAirport.length === 3) {
      originAirports = [originAirport];
    } else {
      const cityAirports = await this.db
        .select({ code: schema.airports.airportCode })
        .from(schema.airports)
        .where(eq(schema.airports.cityCode, originAirport));
      originAirports = cityAirports.map((a) => a.code);
    }

    if (originAirports.length === 0) {
      return [];
    }

    // Direct flights
    const directRows = await this.db
      .select()
      .from(schema.flights)
      .where(
        and(
          inArray(schema.flights.originAirport, originAirports),
          eq(schema.flights.destAirport, destAirport),
          eq(schema.flights.status, 'ACTIVE'),
        ),
      );

    const tzByAirport = await this.loadAirportTimezones();

    const directFlights = await this.attachLegs(directRows);
    const itineraries: FlightItinerary[] = directFlights.map((f) => ({
      flights: [f],
      // Nonstop flights carry no legs; a technical stop adds one touchdown per
      // leg beyond the first.
      stopCount: Math.max(f.legs.length - 1, 0),
      totalPrice: f.price,
      currency: f.currency,
      departureTimeLocal: f.departureTimeLocal,
      arrivalTimeLocal: f.arrivalTimeLocal,
      arrivalDayOffset: f.arrivalDayOffset,
      totalDurationMinutes: journeyDurationMinutes(
        f.originAirport,
        f.departureTimeLocal,
        f.destAirport,
        f.arrivalTimeLocal,
        f.arrivalDayOffset,
        tzByAirport,
      ),
    }));

    // In-memory Graph for 1-Stop and 2-Stop Connections
    const allActiveRows = await this.db
      .select()
      .from(schema.flights)
      .where(eq(schema.flights.status, 'ACTIVE'));

    const allActiveFlights = await this.attachLegs(allActiveRows);

    // Build adjacency list by originAirport
    const adjacencyList = new Map<string, Flight[]>();
    for (const f of allActiveFlights) {
      if (!adjacencyList.has(f.originAirport)) {
        adjacencyList.set(f.originAirport, []);
      }
      adjacencyList.get(f.originAirport)?.push(f);
    }

    type Path = { flights: Flight[]; currentAirport: string };

    // Initialize queue with all valid first hops
    let queue: Path[] = [];
    for (const origin of originAirports) {
      const initialFlights = adjacencyList.get(origin) || [];
      for (const f of initialFlights) {
        // Skip direct flights (already handled)
        if (f.destAirport === destAirport) continue;
        queue.push({ flights: [f], currentAirport: f.destAirport });
      }
    }

    // BFS Traversal (up to 3 segments / 2 stops)
    const MAX_DEPTH = 3;

    for (let depth = 2; depth <= MAX_DEPTH; depth++) {
      const nextQueue: Path[] = [];

      for (const path of queue) {
        const lastFlight = path.flights[path.flights.length - 1];

        // Find all outgoing flights from the current node
        const outgoing = adjacencyList.get(path.currentAirport) || [];

        for (const nextFlight of outgoing) {
          // Avoid cyclic routing back to origin
          if (originAirports.includes(nextFlight.destAirport)) continue;

          // Validate the connection edge
          const isValid = await this.connectionValidator.validateConnection(
            lastFlight,
            nextFlight,
          );
          if (isValid) {
            const newPathFlights = [...path.flights, nextFlight];

            // Did we reach the final destination?
            if (nextFlight.destAirport === destAirport) {
              // Assemble the Journey details
              let totalPrice = 0;
              let totalStops = 0;
              let dayOffset = 0;
              let prevFlight: Flight | null = null;

              for (const f of newPathFlights) {
                totalPrice += f.price;
                totalStops += Math.max(f.legs.length - 1, 0);
                dayOffset += f.arrivalDayOffset;

                if (prevFlight) {
                  totalStops += 1; // The connection itself counts as a stop
                  if (
                    this.parseLocalTime(f.departureTimeLocal) <
                    this.parseLocalTime(prevFlight.arrivalTimeLocal)
                  ) {
                    dayOffset += 1; // Crossed midnight during transfer
                  }
                }
                prevFlight = f;
              }

              const firstFlight = newPathFlights[0];
              const lastFlight = newPathFlights[newPathFlights.length - 1];
              itineraries.push({
                flights: newPathFlights,
                stopCount: totalStops,
                totalPrice,
                currency: firstFlight.currency,
                departureTimeLocal: firstFlight.departureTimeLocal,
                arrivalTimeLocal: lastFlight.arrivalTimeLocal,
                arrivalDayOffset: dayOffset,
                totalDurationMinutes: journeyDurationMinutes(
                  firstFlight.originAirport,
                  firstFlight.departureTimeLocal,
                  lastFlight.destAirport,
                  lastFlight.arrivalTimeLocal,
                  dayOffset,
                  tzByAirport,
                ),
              });
            } else {
              // Enqueue for the next hop
              if (depth < MAX_DEPTH) {
                nextQueue.push({
                  flights: newPathFlights,
                  currentAirport: nextFlight.destAirport,
                });
              }
            }
          }
        }
      }
      queue = nextQueue;
    }

    return itineraries;
  }

  private parseLocalTime(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /** Airport code -> IANA timezone, for turning local times into instants. */
  private async loadAirportTimezones(): Promise<Map<string, string>> {
    const rows = await this.db
      .select({
        code: schema.airports.airportCode,
        timezone: schema.airports.timezone,
      })
      .from(schema.airports);
    return new Map(rows.map((r) => [r.code, r.timezone]));
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

    // Must match `flights_carrier_number_unique` exactly: flights are dateless
    // schedule templates, so a carrier's flight number identifies one flight
    // whatever time it departs. Narrowing this check by departure time let a
    // duplicate past it and into a raw Postgres unique violation — a 500 where
    // the caller should get this 409.
    const [existing] = await this.db
      .select({ id: schema.flights.id })
      .from(schema.flights)
      .where(
        and(
          eq(schema.flights.operatingAirline, input.operatingAirline),
          eq(schema.flights.flightNumber, input.flightNumber),
        ),
      );
    if (existing) {
      throw new ConflictException(
        `Flight ${input.operatingAirline}${input.flightNumber} already exists`,
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
          departureTimeLocal: input.departureTimeLocal,
          arrivalTimeLocal: input.arrivalTimeLocal,
          arrivalDayOffset: input.arrivalDayOffset,
          aircraftType: input.aircraftType,
          status: input.status,
          price: input.price,
          currency: input.currency,
        })
        .returning();

      // A nonstop flight stores no legs, and Drizzle rejects an empty insert.
      const legRows = legs.length
        ? await tx
            .insert(schema.flightLegs)
            .values(
              legs.map((leg, index) => ({
                flightId: flight.id,
                legSequence: index + 1,
                depAirport: leg.depAirport,
                arrAirport: leg.arrAirport,
                departureTimeLocal: leg.departureTimeLocal,
                arrivalTimeLocal: leg.arrivalTimeLocal,
                departureDayOffset: leg.departureDayOffset,
                arrivalDayOffset: leg.arrivalDayOffset,
              })),
            )
            .returning()
        : [];

      return toFlight(flight, legRows);
    });
  }

  async update(id: string, input: UpdateFlightInput): Promise<Flight> {
    await this.findById(id);
    // Rebuild the legs from the incoming schedule, enforcing the same
    // origin/dest/contiguity invariants as create. The operating airline and
    // flight number are immutable identity keys (not in UpdateFlightInput), so
    // uniqueness cannot be violated by an edit.
    const legs = buildFlightLegs(input);

    return this.db.transaction(async (tx) => {
      const [updated] = await tx
        .update(schema.flights)
        .set({
          originAirport: input.originAirport,
          destAirport: input.destAirport,
          departureTimeLocal: input.departureTimeLocal,
          arrivalTimeLocal: input.arrivalTimeLocal,
          arrivalDayOffset: input.arrivalDayOffset,
          aircraftType: input.aircraftType ?? null,
          status: input.status,
          price: input.price,
          currency: input.currency,
        })
        .where(eq(schema.flights.id, id))
        .returning();
      if (!updated) {
        throw new NotFoundException(`Flight ${id} not found after update`);
      }

      // The flight owns its legs — replace them wholesale so a nonstop flight
      // can gain a technical stop (or lose one) in one edit. Dropping to nonstop
      // leaves no rows behind, and Drizzle rejects an empty insert.
      await tx
        .delete(schema.flightLegs)
        .where(eq(schema.flightLegs.flightId, id));
      const legRows = legs.length
        ? await tx
            .insert(schema.flightLegs)
            .values(
              legs.map((leg, index) => ({
                flightId: id,
                legSequence: index + 1,
                depAirport: leg.depAirport,
                arrAirport: leg.arrAirport,
                departureTimeLocal: leg.departureTimeLocal,
                arrivalTimeLocal: leg.arrivalTimeLocal,
                departureDayOffset: leg.departureDayOffset,
                arrivalDayOffset: leg.arrivalDayOffset,
              })),
            )
            .returning()
        : [];

      return toFlight(updated, legRows);
    });
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.db.delete(schema.flights).where(eq(schema.flights.id, id));
  }
}
