import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Database } from '@repo/db';
import { schema } from '@repo/db';
import type {
  CreateFlightHotelPackageInput,
  FlightHotelPackage,
  UpdateFlightHotelPackageInput,
} from '@repo/shared';
import { asc, desc, eq, inArray } from 'drizzle-orm';
import { DATABASE } from '../database/database.module';

type TravelPackageRow = typeof schema.flightHotelPackage.$inferSelect;
type PropertyRow = typeof schema.property.$inferSelect;

// The argument Drizzle hands the transaction callback — same query API as the
// pooled client, used to type the child-write helpers.
type Tx = Parameters<Parameters<Database['transaction']>[0]>[0];

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

  private async resolvePropertyDetails(
    propertyCodes: string[],
  ): Promise<Map<string, PropertyRow>> {
    if (propertyCodes.length === 0) return new Map();
    const properties = await this.db
      .select()
      .from(schema.property)
      .where(inArray(schema.property.propertyCode, propertyCodes));
    return new Map(
      properties.map((property) => [property.propertyCode, property]),
    );
  }

  private async enrich(
    rows: TravelPackageRow[],
  ): Promise<FlightHotelPackage[]> {
    if (rows.length === 0) return [];

    const packageIds = rows.map((row) => row.id);
    const flightIds = [...new Set(rows.map((row) => row.flightId))];

    const flights = await this.db
      .select()
      .from(schema.flights)
      .where(inArray(schema.flights.id, flightIds));
    const flightById = new Map(flights.map((flight) => [flight.id, flight]));
    const flightSummaryById = await this.resolveFlightSummaries(flights);

    // Child rows, batched across all packages and grouped by package id.
    const stayRows = await this.db
      .select()
      .from(schema.travelPackageStay)
      .where(inArray(schema.travelPackageStay.packageId, packageIds))
      .orderBy(asc(schema.travelPackageStay.sequence));
    const propertyByCode = await this.resolvePropertyDetails([
      ...new Set(stayRows.map((stay) => stay.propertyCode)),
    ]);
    const staysByPackage = this.groupBy(stayRows, (stay) => stay.packageId);

    const departureRows = await this.db
      .select()
      .from(schema.travelPackageDeparture)
      .where(inArray(schema.travelPackageDeparture.packageId, packageIds))
      .orderBy(asc(schema.travelPackageDeparture.departureDate));
    const departuresByPackage = this.groupBy(
      departureRows,
      (departure) => departure.packageId,
    );

    const inclusionRows = await this.db
      .select()
      .from(schema.travelPackageInclusion)
      .where(inArray(schema.travelPackageInclusion.packageId, packageIds))
      .orderBy(asc(schema.travelPackageInclusion.sequence));
    const inclusionsByPackage = this.groupBy(
      inclusionRows,
      (inclusion) => inclusion.packageId,
    );

    const itineraryRows = await this.db
      .select()
      .from(schema.travelPackageItineraryDay)
      .where(inArray(schema.travelPackageItineraryDay.packageId, packageIds))
      .orderBy(asc(schema.travelPackageItineraryDay.dayNumber));
    const itineraryByPackage = this.groupBy(
      itineraryRows,
      (day) => day.packageId,
    );

    const result: FlightHotelPackage[] = [];
    for (const row of rows) {
      const flight = flightById.get(row.flightId);
      if (!flight) continue;
      const summary = flightSummaryById.get(flight.id);

      const stays = (staysByPackage.get(row.id) ?? [])
        .map((stay) => {
          const property = propertyByCode.get(stay.propertyCode);
          if (!property) return null;
          return {
            propertyCode: property.propertyCode,
            displayName: property.displayName,
            destination: property.destination,
            starRating: property.starRating,
            distanceMeters: property.distanceMeters,
            distanceNote: property.distanceNote,
            sequence: stay.sequence,
            nights: stay.nights,
          };
        })
        .filter((stay): stay is NonNullable<typeof stay> => stay !== null);

      result.push({
        id: row.id,
        type: row.type,
        title: row.title,
        description: row.description,
        heroImageUrl: row.heroImageUrl,
        price: row.price,
        currency: row.currency,
        durationNights: row.durationNights,
        mealPlan: row.mealPlan,
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
        stays,
        departures: (departuresByPackage.get(row.id) ?? []).map(
          (departure) => ({
            departureDate: departure.departureDate,
            returnDate: departure.returnDate,
            seatsNote: departure.seatsNote,
          }),
        ),
        inclusions: (inclusionsByPackage.get(row.id) ?? []).map(
          (inclusion) => ({ kind: inclusion.kind, label: inclusion.label }),
        ),
        itinerary: (itineraryByPackage.get(row.id) ?? []).map((day) => ({
          dayNumber: day.dayNumber,
          title: day.title,
          description: day.description,
        })),
      });
    }
    return result;
  }

  private groupBy<T>(rows: T[], keyOf: (row: T) => string): Map<string, T[]> {
    const grouped = new Map<string, T[]>();
    for (const row of rows) {
      const key = keyOf(row);
      const bucket = grouped.get(key) ?? [];
      bucket.push(row);
      grouped.set(key, bucket);
    }
    return grouped;
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
        `Travel package ${id} references a missing flight`,
      );
    }
    return enriched;
  }

  async create(
    input: CreateFlightHotelPackageInput,
  ): Promise<FlightHotelPackage> {
    const { stays, departures, inclusions, itinerary, ...scalars } = input;
    const id = await this.db.transaction(async (tx) => {
      const [created] = await tx
        .insert(schema.flightHotelPackage)
        .values(scalars)
        .returning({ id: schema.flightHotelPackage.id });
      await this.replaceChildren(tx, created.id, {
        stays,
        departures,
        inclusions,
        itinerary,
      });
      await this.assertNightsMatch(tx, created.id);
      return created.id;
    });
    return this.findById(id);
  }

  async update(
    id: string,
    input: UpdateFlightHotelPackageInput,
  ): Promise<FlightHotelPackage> {
    await this.findById(id);
    const { stays, departures, inclusions, itinerary, ...scalars } = input;
    await this.db.transaction(async (tx) => {
      if (Object.keys(scalars).length > 0) {
        await tx
          .update(schema.flightHotelPackage)
          .set(scalars)
          .where(eq(schema.flightHotelPackage.id, id));
      }
      await this.replaceChildren(tx, id, {
        stays,
        departures,
        inclusions,
        itinerary,
      });
      await this.assertNightsMatch(tx, id);
    });
    return this.findById(id);
  }

  // Each provided child collection replaces the stored one wholesale; an
  // undefined collection is left untouched (matters for PATCH).
  private async replaceChildren(
    tx: Tx,
    packageId: string,
    children: Partial<
      Pick<
        CreateFlightHotelPackageInput,
        'stays' | 'departures' | 'inclusions' | 'itinerary'
      >
    >,
  ): Promise<void> {
    const { stays, departures, inclusions, itinerary } = children;

    if (stays !== undefined) {
      await tx
        .delete(schema.travelPackageStay)
        .where(eq(schema.travelPackageStay.packageId, packageId));
      if (stays.length > 0) {
        await tx
          .insert(schema.travelPackageStay)
          .values(stays.map((stay) => ({ packageId, ...stay })));
      }
    }

    if (departures !== undefined) {
      await tx
        .delete(schema.travelPackageDeparture)
        .where(eq(schema.travelPackageDeparture.packageId, packageId));
      if (departures.length > 0) {
        await tx.insert(schema.travelPackageDeparture).values(
          departures.map((departure) => ({
            packageId,
            departureDate: departure.departureDate,
            returnDate: departure.returnDate ?? null,
            seatsNote: departure.seatsNote ?? null,
          })),
        );
      }
    }

    if (inclusions !== undefined) {
      await tx
        .delete(schema.travelPackageInclusion)
        .where(eq(schema.travelPackageInclusion.packageId, packageId));
      if (inclusions.length > 0) {
        await tx.insert(schema.travelPackageInclusion).values(
          inclusions.map((inclusion, index) => ({
            packageId,
            kind: inclusion.kind,
            label: inclusion.label,
            sequence: index + 1,
          })),
        );
      }
    }

    if (itinerary !== undefined) {
      await tx
        .delete(schema.travelPackageItineraryDay)
        .where(eq(schema.travelPackageItineraryDay.packageId, packageId));
      if (itinerary.length > 0) {
        await tx.insert(schema.travelPackageItineraryDay).values(
          itinerary.map((day) => ({
            packageId,
            dayNumber: day.dayNumber,
            title: day.title,
            description: day.description ?? null,
          })),
        );
      }
    }
  }

  // Stay nights must sum to the package's durationNights. Read both from the
  // final in-transaction state so it holds regardless of which fields a PATCH
  // touched; throwing rolls the transaction back.
  private async assertNightsMatch(tx: Tx, packageId: string): Promise<void> {
    const [pkg] = await tx
      .select({ durationNights: schema.flightHotelPackage.durationNights })
      .from(schema.flightHotelPackage)
      .where(eq(schema.flightHotelPackage.id, packageId));
    const stays = await tx
      .select({ nights: schema.travelPackageStay.nights })
      .from(schema.travelPackageStay)
      .where(eq(schema.travelPackageStay.packageId, packageId));

    const total = stays.reduce((sum, stay) => sum + stay.nights, 0);
    if (total !== pkg.durationNights) {
      throw new BadRequestException(
        `Stay nights (${total}) must sum to durationNights (${pkg.durationNights})`,
      );
    }
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.db
      .delete(schema.flightHotelPackage)
      .where(eq(schema.flightHotelPackage.id, id));
  }
}
