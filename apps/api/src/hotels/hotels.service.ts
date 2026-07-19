import { Inject, Injectable } from '@nestjs/common';
import type { Database } from '@repo/db';
import { schema } from '@repo/db';
import type {
  HotelSearchQuery,
  HotelSearchResponse,
  HotelSearchResult,
} from '@repo/shared';
import { and, eq, ilike } from 'drizzle-orm';
import { DATABASE } from '../database/database.module';
import type { CurrencyInfo, FxRateRow } from './money';
import { resolvePrice } from './resolver';

type PropertyRow = typeof schema.property.$inferSelect;
type RoomTypeRow = typeof schema.roomType.$inferSelect;

@Injectable()
export class HotelsService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async search(query: HotelSearchQuery): Promise<HotelSearchResponse> {
    const currencies: CurrencyInfo[] = await this.db
      .select({
        code: schema.currency.code,
        minorUnit: schema.currency.minorUnit,
      })
      .from(schema.currency);

    const fxRates: FxRateRow[] = await this.db
      .select({
        baseCurrency: schema.fxRate.baseCurrency,
        quoteCurrency: schema.fxRate.quoteCurrency,
        ratePpm: schema.fxRate.ratePpm,
      })
      .from(schema.fxRate);

    // Room types are global reference data — load the whole catalog once and
    // reuse it for every property. A property "offers" a room type only where a
    // rate rule exists for it; the resolver skips the rest (NO_BAND).
    const roomTypes = await this.db.select().from(schema.roomType);

    const properties = await this.db
      .select()
      .from(schema.property)
      .where(
        and(
          eq(schema.property.isActive, true),
          ilike(schema.property.destination, `%${query.destination}%`),
        ),
      );

    const results: HotelSearchResult[] = [];
    for (const property of properties) {
      const result = await this.resolveProperty(
        property,
        query,
        roomTypes,
        currencies,
        fxRates,
      );
      if (result) {
        results.push(result);
      }
    }

    const filtered = results.filter(
      (r) =>
        (query.minPrice === undefined || r.price.amount >= query.minPrice) &&
        (query.maxPrice === undefined || r.price.amount <= query.maxPrice),
    );

    filtered.sort((a, b) => {
      if (query.sort === 'name')
        return a.displayName.localeCompare(b.displayName);
      if (query.sort === 'price_desc') return b.price.amount - a.price.amount;
      return a.price.amount - b.price.amount;
    });

    return {
      items: filtered.slice(query.offset, query.offset + query.limit),
      total: filtered.length,
    };
  }

  private async resolveProperty(
    property: PropertyRow,
    query: HotelSearchQuery,
    roomTypes: RoomTypeRow[],
    currencies: CurrencyInfo[],
    fxRates: FxRateRow[],
  ): Promise<HotelSearchResult | undefined> {
    if (roomTypes.length === 0) return undefined;

    // The season is selected by the property's own dated windows; the resolver
    // matches rate rules on the global season id, so project each window to it.
    const seasons = await this.db
      .select({
        id: schema.seasonWindow.seasonId,
        startDate: schema.seasonWindow.startDate,
        endDate: schema.seasonWindow.endDate,
      })
      .from(schema.seasonWindow)
      .where(eq(schema.seasonWindow.propertyCode, property.propertyCode));

    const rateRules = await this.db
      .select({
        seasonId: schema.rateRule.seasonId,
        roomTypeId: schema.rateRule.roomTypeId,
        minOccupancy: schema.rateRule.minOccupancy,
        maxOccupancy: schema.rateRule.maxOccupancy,
        amount: schema.rateRule.amount,
        currency: schema.rateRule.currency,
      })
      .from(schema.rateRule)
      .where(eq(schema.rateRule.propertyCode, property.propertyCode));

    // Room type selection: the hint if given and it matches one of this
    // property's room types, else try every room type and keep the
    // cheapest qualifying one — see prd/hotels/13-resolver-and-search.md.
    const hinted = query.roomType
      ? roomTypes.filter((rt) => rt.name === query.roomType)
      : [];
    const candidates = hinted.length > 0 ? hinted : roomTypes;

    let best:
      | {
          roomType: RoomTypeRow;
          converted: HotelSearchResult['price'];
          native: HotelSearchResult['nativePrice'];
          breakdown: HotelSearchResult['breakdown'];
        }
      | undefined;
    for (const roomType of candidates) {
      const outcome = resolvePrice({
        listing: { isActive: property.isActive },
        seasons,
        rateRules,
        checkIn: query.checkIn,
        checkOut: query.checkOut,
        occupancy: query.occupancy,
        displayCurrency: query.currency,
        roomTypeId: roomType.id,
        fxRates,
        currencies,
      });
      if (outcome.outcome !== 'OK') continue;
      if (!best || outcome.converted.amount < best.converted.amount) {
        best = {
          roomType,
          converted: outcome.converted,
          native: outcome.native,
          breakdown: outcome.breakdown,
        };
      }
    }
    if (!best) return undefined;

    return {
      propertyCode: property.propertyCode,
      displayName: property.displayName,
      destination: property.destination,
      heroImageUrl: property.heroImageUrl,
      price: best.converted,
      nativePrice: best.native,
      breakdown: best.breakdown,
      starRating: property.starRating,
    };
  }
}
