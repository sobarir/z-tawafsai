import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Database } from '@repo/db';
import { schema } from '@repo/db';
import type {
  CreateFlightHotelPackageInput,
  FlightHotelPackage,
  UpdateFlightHotelPackageInput,
} from '@repo/shared';
import { desc, eq, inArray } from 'drizzle-orm';
import { DATABASE } from '../database/database.module';

type TravelPackageRow = typeof schema.flightHotelPackage.$inferSelect;

interface FlightSummaryDetail {
  airlineName: string;
  isDirect: boolean;
  transitAirport: string | null;
  transitCityName: string | null;
}

@Injectable()
export class TravelPackagesService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  /** Airline name + direct/transit info per flight, batched by flight id. */
  private async resolveFlightSummaries(
    flights: (typeof schema.flights.$inferSelect)[],
  ): Promise<Map<string, FlightSummaryDetail>> {
    const flightIds = flights.map((flight) => flight.id);
    const airlineCodes = [
      ...new Set(flights.map((flight) => flight.operatingAirline)),
    ];

    const airlines = airlineCodes.length
      ? await this.db
          .select()
          .from(schema.airlines)
          .where(inArray(schema.airlines.airlineCode, airlineCodes))
      : [];
    const airlineNameByCode = new Map(
      airlines.map((airline) => [airline.airlineCode, airline.name]),
    );

    const legs = await this.db
      .select()
      .from(schema.flightLegs)
      .where(inArray(schema.flightLegs.flightId, flightIds));
    const transitAirportByFlightId = this.groupTransitAirports(legs);
    const cityNameByAirport = await this.resolveCityNames([
      ...new Set(transitAirportByFlightId.values()),
    ]);

    const result = new Map<string, FlightSummaryDetail>();
    for (const flight of flights) {
      const transitAirport = transitAirportByFlightId.get(flight.id) ?? null;
      result.set(flight.id, {
        airlineName:
          airlineNameByCode.get(flight.operatingAirline) ??
          flight.operatingAirline,
        isDirect: transitAirport === null,
        transitAirport,
        transitCityName: transitAirport
          ? (cityNameByAirport.get(transitAirport) ?? null)
          : null,
      });
    }
    return result;
  }

  // A technical stop is an internal stop within one operating flight — a
  // "transit", not a cross-flight connection (see /prd/flights/01-glossary.md).
  private groupTransitAirports(
    legs: (typeof schema.flightLegs.$inferSelect)[],
  ): Map<string, string> {
    const legsByFlightId = new Map<
      string,
      (typeof schema.flightLegs.$inferSelect)[]
    >();
    for (const leg of legs) {
      const flightLegs = legsByFlightId.get(leg.flightId) ?? [];
      flightLegs.push(leg);
      legsByFlightId.set(leg.flightId, flightLegs);
    }

    const transitAirportByFlightId = new Map<string, string>();
    for (const [flightId, flightLegs] of legsByFlightId) {
      if (flightLegs.length <= 1) continue;
      const [firstLeg] = flightLegs.sort(
        (a, b) => a.legSequence - b.legSequence,
      );
      transitAirportByFlightId.set(flightId, firstLeg.arrAirport);
    }
    return transitAirportByFlightId;
  }

  private async resolveCityNames(
    airportCodes: string[],
  ): Promise<Map<string, string>> {
    if (airportCodes.length === 0) return new Map();

    const airports = await this.db
      .select()
      .from(schema.airports)
      .where(inArray(schema.airports.airportCode, airportCodes));
    const cityCodes = [...new Set(airports.map((airport) => airport.cityCode))];
    const cities = cityCodes.length
      ? await this.db
          .select()
          .from(schema.city)
          .where(inArray(schema.city.cityCode, cityCodes))
      : [];
    const cityNameByCode = new Map(
      cities.map((city) => [city.cityCode, city.name]),
    );

    const cityNameByAirport = new Map<string, string>();
    for (const airport of airports) {
      const name = cityNameByCode.get(airport.cityCode);
      if (name) cityNameByAirport.set(airport.airportCode, name);
    }
    return cityNameByAirport;
  }

  private async resolvePropertyDetails(propertyCodes: string[]) {
    const properties = await this.db
      .select()
      .from(schema.property)
      .where(inArray(schema.property.propertyCode, propertyCodes));
    const listingIds = properties.map((property) => property.listingId);
    const listings = listingIds.length
      ? await this.db
          .select()
          .from(schema.listing)
          .where(inArray(schema.listing.id, listingIds))
      : [];
    const listingById = new Map(
      listings.map((listing) => [listing.id, listing]),
    );
    return new Map(
      properties.map((property) => [
        property.propertyCode,
        { property, listing: listingById.get(property.listingId) },
      ]),
    );
  }

  private async enrich(
    rows: TravelPackageRow[],
  ): Promise<FlightHotelPackage[]> {
    if (rows.length === 0) return [];

    const flightIds = [...new Set(rows.map((row) => row.flightId))];
    const propertyCodes = [...new Set(rows.map((row) => row.propertyCode))];

    const flights = await this.db
      .select()
      .from(schema.flights)
      .where(inArray(schema.flights.id, flightIds));
    const flightById = new Map(flights.map((flight) => [flight.id, flight]));
    const flightSummaryById = await this.resolveFlightSummaries(flights);
    const propertyByCode = await this.resolvePropertyDetails(propertyCodes);

    const result: FlightHotelPackage[] = [];
    for (const row of rows) {
      const flight = flightById.get(row.flightId);
      const propertyEntry = propertyByCode.get(row.propertyCode);
      if (!flight || !propertyEntry?.listing) continue;
      const { property, listing } = propertyEntry;
      const summary = flightSummaryById.get(flight.id);

      result.push({
        id: row.id,
        title: row.title,
        description: row.description,
        heroImageUrl: row.heroImageUrl,
        price: row.price,
        currency: row.currency,
        durationNights: row.durationNights,
        isActive: row.isActive,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
        flight: {
          id: flight.id,
          operatingAirline: flight.operatingAirline,
          airlineName: summary?.airlineName ?? flight.operatingAirline,
          flightNumber: flight.flightNumber,
          originAirport: flight.originAirport,
          destAirport: flight.destAirport,
          departureTime: flight.departureTime.toISOString(),
          arrivalTime: flight.arrivalTime.toISOString(),
          isDirect: summary?.isDirect ?? true,
          transitAirport: summary?.transitAirport ?? null,
          transitCityName: summary?.transitCityName ?? null,
        },
        property: {
          propertyCode: property.propertyCode,
          displayName: listing.displayName,
          destination: listing.destination,
          starRating: property.starRating,
        },
      });
    }
    return result;
  }

  async list(): Promise<FlightHotelPackage[]> {
    const rows = await this.db
      .select()
      .from(schema.flightHotelPackage)
      .orderBy(desc(schema.flightHotelPackage.createdAt));
    return this.enrich(rows);
  }

  async findById(id: string): Promise<FlightHotelPackage> {
    const [row] = await this.db
      .select()
      .from(schema.flightHotelPackage)
      .where(eq(schema.flightHotelPackage.id, id));
    if (!row) {
      throw new NotFoundException(`Travel package ${id} not found`);
    }
    const [enriched] = await this.enrich([row]);
    if (!enriched) {
      throw new NotFoundException(
        `Travel package ${id} references a missing flight or property`,
      );
    }
    return enriched;
  }

  async create(
    input: CreateFlightHotelPackageInput,
  ): Promise<FlightHotelPackage> {
    const [created] = await this.db
      .insert(schema.flightHotelPackage)
      .values(input)
      .returning();
    return this.findById(created.id);
  }

  async update(
    id: string,
    input: UpdateFlightHotelPackageInput,
  ): Promise<FlightHotelPackage> {
    await this.findById(id);
    const [updated] = await this.db
      .update(schema.flightHotelPackage)
      .set(input)
      .where(eq(schema.flightHotelPackage.id, id))
      .returning();
    return this.findById(updated.id);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.db
      .delete(schema.flightHotelPackage)
      .where(eq(schema.flightHotelPackage.id, id));
  }
}
