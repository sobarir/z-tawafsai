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
 * Derives the ordered legs to insert for a new flight, enforcing the
 * invariants from /prd/flights/11-data-model.md Entity 4: no legs given -> one FULL
 * leg spanning the flight's own route; legs given -> first leg departs the
 * flight origin, last leg arrives the flight destination, and legs are
 * sequentially connected.
 */
function buildFlightLegs(input: CreateFlightInput): CreateFlightLegInput[] {
  if (!input.legs || input.legs.length === 0) {
    return [
      {
        role: 'FULL',
        depAirport: input.originAirport,
        arrAirport: input.destAirport,
        departureTimeLocal: input.departureTimeLocal,
        arrivalTimeLocal: input.arrivalTimeLocal,
        departureDayOffset: 0,
        arrivalDayOffset: input.arrivalDayOffset,
      },
    ];
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

    const directFlights = await this.attachLegs(directRows);
    const itineraries: FlightItinerary[] = directFlights.map((f) => ({
      flights: [f],
      stopCount: f.legs.length - 1,
      totalPrice: f.price,
      currency: f.currency,
      departureTimeLocal: f.departureTimeLocal,
      arrivalTimeLocal: f.arrivalTimeLocal,
      arrivalDayOffset: f.arrivalDayOffset,
      totalDurationMinutes: 120, // Dummy duration for now
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
                totalStops += f.legs.length - 1;
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

              itineraries.push({
                flights: newPathFlights,
                stopCount: totalStops,
                totalPrice,
                currency: newPathFlights[0].currency,
                departureTimeLocal: newPathFlights[0].departureTimeLocal,
                arrivalTimeLocal:
                  newPathFlights[newPathFlights.length - 1].arrivalTimeLocal,
                arrivalDayOffset: dayOffset,
                totalDurationMinutes:
                  newPathFlights.length * 120 +
                  (newPathFlights.length - 1) * 60, // Dummy approximation
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
          eq(schema.flights.departureTimeLocal, input.departureTimeLocal),
        ),
      );
    if (existing) {
      throw new ConflictException(
        `Flight ${input.operatingAirline}${input.flightNumber} at ${input.departureTimeLocal} already exists`,
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

      const legRows = await tx
        .insert(schema.flightLegs)
        .values(
          legs.map((leg, index) => ({
            flightId: flight.id,
            legSequence: index + 1,
            role: leg.role,
            depAirport: leg.depAirport,
            arrAirport: leg.arrAirport,
            departureTimeLocal: leg.departureTimeLocal,
            arrivalTimeLocal: leg.arrivalTimeLocal,
            departureDayOffset: leg.departureDayOffset,
            arrivalDayOffset: leg.arrivalDayOffset,
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
    if (!updated) {
      throw new NotFoundException(`Flight ${id} not found after update`);
    }
    return toFlight(updated, legRows);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.db.delete(schema.flights).where(eq(schema.flights.id, id));
  }
}
