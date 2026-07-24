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
import { journeyDurationMinutes, parseLocalTime } from './journey-duration';

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

/** A partially built connection: the flights taken so far and where they end. */
type ConnectionPath = { flights: Flight[]; currentAirport: string };

/** Longest itinerary the connection search will assemble — 3 segments / 2 stops. */
const MAX_SEGMENTS = 3;

/** The flights boardable at each airport, keyed by the airport they depart. */
function buildAdjacencyList(flights: Flight[]): Map<string, Flight[]> {
  const adjacency = new Map<string, Flight[]>();
  for (const flight of flights) {
    const existing = adjacency.get(flight.originAirport);
    if (existing) {
      existing.push(flight);
    } else {
      adjacency.set(flight.originAirport, [flight]);
    }
  }
  return adjacency;
}

/** First hops out of the origin metro that are not already direct flights. */
function seedConnectionPaths(
  originAirports: string[],
  destAirport: string,
  adjacency: Map<string, Flight[]>,
): ConnectionPath[] {
  const seeds: ConnectionPath[] = [];
  for (const origin of originAirports) {
    for (const flight of adjacency.get(origin) ?? []) {
      if (flight.destAirport === destAirport) continue;
      seeds.push({ flights: [flight], currentAirport: flight.destAirport });
    }
  }
  return seeds;
}

/** One flight sold on its own. */
function toDirectItinerary(
  flight: Flight,
  tzByAirport: Map<string, string>,
): FlightItinerary {
  return {
    flights: [flight],
    // Nonstop flights carry no legs; a technical stop adds one touchdown per
    // leg beyond the first.
    stopCount: Math.max(flight.legs.length - 1, 0),
    totalPrice: flight.price,
    currency: flight.currency,
    departureTimeLocal: flight.departureTimeLocal,
    arrivalTimeLocal: flight.arrivalTimeLocal,
    arrivalDayOffset: flight.arrivalDayOffset,
    totalDurationMinutes: journeyDurationMinutes(
      flight.originAirport,
      flight.departureTimeLocal,
      flight.destAirport,
      flight.arrivalTimeLocal,
      flight.arrivalDayOffset,
      tzByAirport,
    ),
  };
}

/**
 * Folds a chain of flights into one sellable itinerary. Each connection counts
 * as a stop on top of the flights' own technical stops, and a transfer whose
 * next departure reads earlier on the clock than the previous arrival has
 * crossed midnight — the only way a dateless schedule can express that.
 */
function toConnectingItinerary(
  flights: Flight[],
  tzByAirport: Map<string, string>,
): FlightItinerary {
  let totalPrice = 0;
  let stopCount = 0;
  let arrivalDayOffset = 0;
  let prevFlight: Flight | null = null;

  for (const flight of flights) {
    totalPrice += flight.price;
    stopCount += Math.max(flight.legs.length - 1, 0);
    arrivalDayOffset += flight.arrivalDayOffset;

    if (prevFlight) {
      stopCount += 1;
      if (
        parseLocalTime(flight.departureTimeLocal) <
        parseLocalTime(prevFlight.arrivalTimeLocal)
      ) {
        arrivalDayOffset += 1;
      }
    }
    prevFlight = flight;
  }

  const firstFlight = flights[0];
  const lastFlight = flights[flights.length - 1];
  return {
    flights,
    stopCount,
    totalPrice,
    currency: firstFlight.currency,
    departureTimeLocal: firstFlight.departureTimeLocal,
    arrivalTimeLocal: lastFlight.arrivalTimeLocal,
    arrivalDayOffset,
    totalDurationMinutes: journeyDurationMinutes(
      firstFlight.originAirport,
      firstFlight.departureTimeLocal,
      lastFlight.destAirport,
      lastFlight.arrivalTimeLocal,
      arrivalDayOffset,
      tzByAirport,
    ),
  };
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
   * Search for Master Schedule Flights: every direct flight on the route, plus
   * every valid connection of up to MAX_SEGMENTS segments.
   */
  async search(query: SearchFlightsQuery): Promise<FlightItinerary[]> {
    const { originAirport, destAirport } = query;

    const originAirports = await this.resolveOriginAirports(originAirport);
    if (originAirports.length === 0) {
      return [];
    }

    const tzByAirport = await this.loadAirportTimezones();

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
    const directFlights = await this.attachLegs(directRows);

    const connecting = await this.findConnectingItineraries(
      originAirports,
      destAirport,
      tzByAirport,
    );

    return [
      ...directFlights.map((f) => toDirectItinerary(f, tzByAirport)),
      ...connecting,
    ];
  }

  /** The airports a search origin covers — itself, or every airport in the city. */
  private async resolveOriginAirports(
    originAirport: string,
  ): Promise<string[]> {
    if (originAirport.length === 3) {
      return [originAirport];
    }
    const cityAirports = await this.db
      .select({ code: schema.airports.airportCode })
      .from(schema.airports)
      .where(eq(schema.airports.cityCode, originAirport));
    return cityAirports.map((a) => a.code);
  }

  /**
   * Breadth-first walk of the active-flight graph. Each round extends every
   * surviving path by one hop; a path that reaches the destination becomes an
   * itinerary, anything else is carried into the next round until the segment
   * ceiling is hit.
   */
  private async findConnectingItineraries(
    originAirports: string[],
    destAirport: string,
    tzByAirport: Map<string, string>,
  ): Promise<FlightItinerary[]> {
    const activeRows = await this.db
      .select()
      .from(schema.flights)
      .where(eq(schema.flights.status, 'ACTIVE'));
    const adjacency = buildAdjacencyList(await this.attachLegs(activeRows));

    let queue = seedConnectionPaths(originAirports, destAirport, adjacency);
    const itineraries: FlightItinerary[] = [];

    for (let segments = 2; segments <= MAX_SEGMENTS; segments++) {
      const { arrived, pending } = await this.advanceRound(
        queue,
        adjacency,
        originAirports,
        destAirport,
      );

      for (const path of arrived) {
        itineraries.push(toConnectingItinerary(path.flights, tzByAirport));
      }

      // The final round has nowhere to carry surviving paths forward to.
      queue = segments < MAX_SEGMENTS ? pending : [];
    }

    return itineraries;
  }

  /** One BFS round: paths that reached the destination, and those still in flight. */
  private async advanceRound(
    queue: ConnectionPath[],
    adjacency: Map<string, Flight[]>,
    originAirports: string[],
    destAirport: string,
  ): Promise<{ arrived: ConnectionPath[]; pending: ConnectionPath[] }> {
    const arrived: ConnectionPath[] = [];
    const pending: ConnectionPath[] = [];

    for (const path of queue) {
      const extensions = await this.extendPath(path, adjacency, originAirports);

      for (const extended of extensions) {
        if (extended.currentAirport === destAirport) {
          arrived.push(extended);
        } else {
          pending.push(extended);
        }
      }
    }

    return { arrived, pending };
  }

  /** Every legal one-hop extension of a path, skipping routes back to the origin. */
  private async extendPath(
    path: ConnectionPath,
    adjacency: Map<string, Flight[]>,
    originAirports: string[],
  ): Promise<ConnectionPath[]> {
    const lastFlight = path.flights[path.flights.length - 1];
    const extended: ConnectionPath[] = [];

    for (const nextFlight of adjacency.get(path.currentAirport) ?? []) {
      if (originAirports.includes(nextFlight.destAirport)) continue;

      const isValid = await this.connectionValidator.validateConnection(
        lastFlight,
        nextFlight,
      );
      if (!isValid) continue;

      extended.push({
        flights: [...path.flights, nextFlight],
        currentAirport: nextFlight.destAirport,
      });
    }

    return extended;
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
