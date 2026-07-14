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
import { type RateRuleRow, resolvePrice, type SeasonRow } from './resolver';

type ListingRow = typeof schema.listing.$inferSelect;
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

    const listings = await this.db
      .select()
      .from(schema.listing)
      .where(
        and(
          eq(schema.listing.isActive, true),
          ilike(schema.listing.destination, `%${query.destination}%`),
          query.kind === 'both'
            ? undefined
            : eq(schema.listing.kind, query.kind),
        ),
      );

    const results: HotelSearchResult[] = [];
    for (const listing of listings) {
      const result =
        listing.kind === 'property'
          ? await this.resolveProperty(listing, query, currencies, fxRates)
          : await this.resolvePackage(listing, query, currencies, fxRates);
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

  private async loadSeasonsAndRates(
    listingId: string,
  ): Promise<{ seasons: SeasonRow[]; rateRules: RateRuleRow[] }> {
    const seasons = await this.db
      .select({
        id: schema.season.id,
        startDate: schema.season.startDate,
        endDate: schema.season.endDate,
      })
      .from(schema.season)
      .where(eq(schema.season.listingId, listingId));

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
      .where(eq(schema.rateRule.listingId, listingId));

    return { seasons, rateRules };
  }

  private async resolveProperty(
    listing: ListingRow,
    query: HotelSearchQuery,
    currencies: CurrencyInfo[],
    fxRates: FxRateRow[],
  ): Promise<HotelSearchResult | undefined> {
    const [propertyRow] = await this.db
      .select()
      .from(schema.property)
      .where(eq(schema.property.listingId, listing.id));
    if (!propertyRow) return undefined;

    const roomTypes = await this.db
      .select()
      .from(schema.roomType)
      .where(eq(schema.roomType.propertyCode, propertyRow.propertyCode));
    if (roomTypes.length === 0) return undefined;

    const { seasons, rateRules } = await this.loadSeasonsAndRates(listing.id);

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
        listing: { kind: 'property', isActive: listing.isActive },
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
      listingId: listing.id,
      kind: 'property',
      displayName: listing.displayName,
      destination: listing.destination,
      heroImageUrl: listing.heroImageUrl,
      price: best.converted,
      nativePrice: best.native,
      breakdown: best.breakdown,
      starRating: propertyRow.starRating,
    };
  }

  private async resolvePackage(
    listing: ListingRow,
    query: HotelSearchQuery,
    currencies: CurrencyInfo[],
    fxRates: FxRateRow[],
  ): Promise<HotelSearchResult | undefined> {
    const [packageRow] = await this.db
      .select()
      .from(schema.travelPackage)
      .where(eq(schema.travelPackage.listingId, listing.id));
    if (!packageRow) return undefined;

    const { seasons, rateRules } = await this.loadSeasonsAndRates(listing.id);

    const outcome = resolvePrice({
      listing: { kind: 'package', isActive: listing.isActive },
      seasons,
      rateRules,
      checkIn: query.checkIn,
      checkOut: query.checkOut,
      occupancy: query.occupancy,
      displayCurrency: query.currency,
      fxRates,
      currencies,
    });
    if (outcome.outcome !== 'OK') return undefined;

    return {
      listingId: listing.id,
      kind: 'package',
      displayName: listing.displayName,
      destination: listing.destination,
      heroImageUrl: listing.heroImageUrl,
      price: outcome.converted,
      nativePrice: outcome.native,
      breakdown: outcome.breakdown,
      durationNights: packageRow.durationNights,
    };
  }
}
