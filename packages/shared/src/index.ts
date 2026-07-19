import { z } from 'zod';

/**
 * ULID: 26 chars, Crockford base32 (no I, L, O, U).
 * All generated IDs in this system are ULIDs — app tables and auth records.
 */
export const ulidSchema = z
  .string()
  .regex(/^[0-9A-HJKMNP-TV-Z]{26}$/, 'Invalid ULID');

/**
 * Contracts shared between apps/web and apps/api.
 *
 * - apps/api derives NestJS DTOs from these via nestjs-zod (validation +
 *   OpenAPI schemas), see apps/api/src/posts/posts.dto.ts
 * - apps/web gets typed TanStack Query hooks generated from the resulting
 *   OpenAPI spec via Orval
 *
 * Note: these describe the JSON wire format — dates are ISO strings.
 */

export const postSchema = z.object({
  id: ulidSchema,
  title: z.string(),
  content: z.string().nullable(),
  authorId: ulidSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type Post = z.infer<typeof postSchema>;

export const postListSchema = z.array(postSchema);

export const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().max(10_000).optional(),
});
export type CreatePostInput = z.infer<typeof createPostSchema>;

/** 3 uppercase letters, with a code-specific error message. */
function letterCodeSchema(label: string) {
  return z.string().regex(/^[A-Z]{3}$/, `Invalid ${label}`);
}

/** IATA airport code: 3 uppercase letters (JFK, NRT). */
export const airportCodeSchema = letterCodeSchema('IATA airport code');

/** IATA airline code: 2 uppercase alphanumerics (GA, NH, 5J). */
export const airlineCodeSchema = z
  .string()
  .regex(/^[A-Z0-9]{2}$/, 'Invalid IATA airline code');

/** City reference code: 3 uppercase letters (NYC, LON, JED). */
export const cityCodeSchema = letterCodeSchema('city code');

/** ISO 4217 currency code: 3 uppercase letters (USD, EUR, IDR). */
export const currencyCodeSchema = letterCodeSchema('currency code');

export const citySchema = z.object({
  cityCode: cityCodeSchema,
  name: z.string().min(1).max(100),
  countryCode: z.string().length(2),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type City = z.infer<typeof citySchema>;

export const cityListSchema = z.array(citySchema);

export const createCitySchema = z.object({
  cityCode: cityCodeSchema,
  name: z.string().min(1).max(100),
  countryCode: z.string().length(2),
});
export type CreateCityInput = z.infer<typeof createCitySchema>;

export const updateCitySchema = createCitySchema
  .omit({ cityCode: true })
  .partial();
export type UpdateCityInput = z.infer<typeof updateCitySchema>;

export const airportSchema = z.object({
  airportCode: airportCodeSchema,
  icaoCode: z.string().length(4).nullable(),
  name: z.string(),
  cityCode: cityCodeSchema,
  countryCode: z.string().length(2),
  timezone: z.string(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type Airport = z.infer<typeof airportSchema>;

export const airportListSchema = z.array(airportSchema);

export const createAirportSchema = z.object({
  airportCode: airportCodeSchema,
  icaoCode: z.string().length(4).optional(),
  name: z.string().min(1).max(100),
  cityCode: cityCodeSchema,
  countryCode: z.string().length(2),
  timezone: z.string().min(1).max(50),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});
export type CreateAirportInput = z.infer<typeof createAirportSchema>;

export const updateAirportSchema = createAirportSchema
  .omit({ airportCode: true })
  .partial();
export type UpdateAirportInput = z.infer<typeof updateAirportSchema>;

export const airlineSchema = z.object({
  airlineCode: airlineCodeSchema,
  icaoCode: z.string().length(3).nullable(),
  name: z.string(),
  countryCode: z.string().length(2),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type Airline = z.infer<typeof airlineSchema>;

export const airlineListSchema = z.array(airlineSchema);

export const createAirlineSchema = z.object({
  airlineCode: airlineCodeSchema,
  icaoCode: z.string().length(3).optional(),
  name: z.string().min(1).max(100),
  countryCode: z.string().length(2),
});
export type CreateAirlineInput = z.infer<typeof createAirlineSchema>;

export const updateAirlineSchema = createAirlineSchema
  .omit({ airlineCode: true })
  .partial();
export type UpdateAirlineInput = z.infer<typeof updateAirlineSchema>;

/** Physical flight status. */
export const flightStatusSchema = z.enum(['ACTIVE', 'SUSPENDED', 'SEASONAL']);
export type FlightStatus = z.infer<typeof flightStatusSchema>;

/** Whether a leg is the flight's whole journey (FULL) or an internal technical stop. */
export const legRoleSchema = z.enum(['FULL', 'TECHNICAL_STOP']);
export type LegRole = z.infer<typeof legRoleSchema>;

/** IATA flight number: 1-4 digits with an optional trailing letter (e.g. '10', '874'). */
export const flightNumberSchema = z
  .string()
  .regex(/^[0-9]{1,4}[A-Z]?$/, 'Invalid flight number');

/**
 * Scheduled departure/arrival times are local to the airport and carry their
 * UTC offset (e.g. '2026-06-01T10:45:00+09:00') rather than being forced to
 * UTC — schedules are authored and read in local airport time.
 */
export const offsetDateTimeSchema = z.iso.datetime({ offset: true });

export const flightLegSchema = z.object({
  id: ulidSchema,
  flightId: ulidSchema,
  legSequence: z.number().int().min(1),
  role: legRoleSchema,
  depAirport: airportCodeSchema,
  arrAirport: airportCodeSchema,
  departureTime: offsetDateTimeSchema,
  arrivalTime: offsetDateTimeSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type FlightLeg = z.infer<typeof flightLegSchema>;

export const flightSchema = z.object({
  id: ulidSchema,
  operatingAirline: airlineCodeSchema,
  flightNumber: flightNumberSchema,
  originAirport: airportCodeSchema,
  destAirport: airportCodeSchema,
  departureTime: offsetDateTimeSchema,
  arrivalTime: offsetDateTimeSchema,
  aircraftType: z.string().max(10).nullable(),
  status: flightStatusSchema,
  /** Flat, admin-managed price for search display/sorting — not a fare class. */
  price: z.number().nonnegative(),
  currency: currencyCodeSchema,
  legs: z.array(flightLegSchema),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type Flight = z.infer<typeof flightSchema>;

export const flightListSchema = z.array(flightSchema);

export const createFlightLegInputSchema = z.object({
  role: legRoleSchema,
  depAirport: airportCodeSchema,
  arrAirport: airportCodeSchema,
  departureTime: offsetDateTimeSchema,
  arrivalTime: offsetDateTimeSchema,
});
export type CreateFlightLegInput = z.infer<typeof createFlightLegInputSchema>;

export const createFlightSchema = z.object({
  operatingAirline: airlineCodeSchema,
  flightNumber: flightNumberSchema,
  originAirport: airportCodeSchema,
  destAirport: airportCodeSchema,
  departureTime: offsetDateTimeSchema,
  arrivalTime: offsetDateTimeSchema,
  aircraftType: z.string().max(10).optional(),
  status: flightStatusSchema.optional(),
  price: z.number().nonnegative(),
  currency: currencyCodeSchema,
  /** Omit for a single-leg flight (auto-creates one FULL leg). Provide >=2 for a technical stop. */
  legs: z.array(createFlightLegInputSchema).min(2).optional(),
});
export type CreateFlightInput = z.infer<typeof createFlightSchema>;

export const updateFlightSchema = z.object({
  aircraftType: z.string().max(10).optional(),
  status: flightStatusSchema.optional(),
  price: z.number().nonnegative().optional(),
  currency: currencyCodeSchema.optional(),
});
export type UpdateFlightInput = z.infer<typeof updateFlightSchema>;

/** Query for the OTA-style search endpoint — matches on route + UTC calendar day of departure. */
export const searchFlightsQuerySchema = z.object({
  originAirport: airportCodeSchema,
  destAirport: airportCodeSchema,
  date: z.iso.date(),
});
export type SearchFlightsQuery = z.infer<typeof searchFlightsQuerySchema>;

/**
 * A sellable/displayable identity mapped onto an operating flight
 * (`flights`). Codeshare = many marketing rows -> one operating flight; see
 * /prd/flights/01-glossary.md.
 */
export const flightMarketingSchema = z.object({
  id: ulidSchema,
  flightId: ulidSchema,
  marketingAirline: airlineCodeSchema,
  marketingNumber: flightNumberSchema,
  isOperatingCarrier: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type FlightMarketing = z.infer<typeof flightMarketingSchema>;

export const flightMarketingListSchema = z.array(flightMarketingSchema);

export const createFlightMarketingSchema = z.object({
  flightId: ulidSchema,
  marketingAirline: airlineCodeSchema,
  marketingNumber: flightNumberSchema,
  isOperatingCarrier: z.boolean().optional(),
});
export type CreateFlightMarketingInput = z.infer<
  typeof createFlightMarketingSchema
>;

export const updateFlightMarketingSchema = z.object({
  marketingNumber: flightNumberSchema.optional(),
  isOperatingCarrier: z.boolean().optional(),
});
export type UpdateFlightMarketingInput = z.infer<
  typeof updateFlightMarketingSchema
>;

/** Domestic/international combination at the connection airport; see /prd/flights/13-mct-rules.md §A. */
export const mctScopeSchema = z.enum(['DD', 'DI', 'ID', 'II']);
export type MctScope = z.infer<typeof mctScopeSchema>;

/** IATA terminal designator, e.g. '1', '2', 'S'. */
export const terminalSchema = z.string().min(1).max(5);

export const mctRuleSchema = z.object({
  id: ulidSchema,
  arrivalAirport: airportCodeSchema,
  departureAirport: airportCodeSchema,
  scope: mctScopeSchema,
  arrivalAirline: airlineCodeSchema.nullable(),
  departureAirline: airlineCodeSchema.nullable(),
  arrivalTerminal: terminalSchema.nullable(),
  departureTerminal: terminalSchema.nullable(),
  mctMinutes: z.number().int().positive(),
  maxConnectionMinutes: z.number().int().positive(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type MctRule = z.infer<typeof mctRuleSchema>;

export const mctRuleListSchema = z.array(mctRuleSchema);

export const createMctRuleSchema = z
  .object({
    arrivalAirport: airportCodeSchema,
    departureAirport: airportCodeSchema,
    scope: mctScopeSchema,
    arrivalAirline: airlineCodeSchema.optional(),
    departureAirline: airlineCodeSchema.optional(),
    arrivalTerminal: terminalSchema.optional(),
    departureTerminal: terminalSchema.optional(),
    mctMinutes: z.number().int().positive(),
    maxConnectionMinutes: z.number().int().positive().optional(),
  })
  .refine((data) => (data.maxConnectionMinutes ?? 1440) >= data.mctMinutes, {
    message: 'maxConnectionMinutes must be >= mctMinutes',
    path: ['maxConnectionMinutes'],
  });
export type CreateMctRuleInput = z.infer<typeof createMctRuleSchema>;

export const updateMctRuleSchema = z.object({
  arrivalAirline: airlineCodeSchema.optional(),
  departureAirline: airlineCodeSchema.optional(),
  arrivalTerminal: terminalSchema.optional(),
  departureTerminal: terminalSchema.optional(),
  mctMinutes: z.number().int().positive().optional(),
  maxConnectionMinutes: z.number().int().positive().optional(),
});
export type UpdateMctRuleInput = z.infer<typeof updateMctRuleSchema>;

/** Query for the most-specific-first resolver (/prd/flights/13-mct-rules.md §A). */
export const resolveMctRuleQuerySchema = z.object({
  arrivalAirport: airportCodeSchema,
  departureAirport: airportCodeSchema,
  scope: mctScopeSchema,
  arrivalAirline: airlineCodeSchema.optional(),
  departureAirline: airlineCodeSchema.optional(),
  arrivalTerminal: terminalSchema.optional(),
  departureTerminal: terminalSchema.optional(),
});
export type ResolveMctRuleQuery = z.infer<typeof resolveMctRuleQuerySchema>;

/**
 * Directional carrier-pair gate: does the inbound operating carrier permit a
 * through-ticketed interline connection onto the outbound operating carrier?
 * See /prd/flights/01-glossary.md (codeshare vs interline) and /prd/flights/13-mct-rules.md §A2.
 */
export const interlineAgreementSchema = z.object({
  id: ulidSchema,
  inboundAirline: airlineCodeSchema,
  outboundAirline: airlineCodeSchema,
  bagThroughChecked: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type InterlineAgreement = z.infer<typeof interlineAgreementSchema>;

export const interlineAgreementListSchema = z.array(interlineAgreementSchema);

export const createInterlineAgreementSchema = z
  .object({
    inboundAirline: airlineCodeSchema,
    outboundAirline: airlineCodeSchema,
    bagThroughChecked: z.boolean().optional(),
  })
  .refine((data) => data.inboundAirline !== data.outboundAirline, {
    message: 'inboundAirline and outboundAirline must differ',
    path: ['outboundAirline'],
  });
export type CreateInterlineAgreementInput = z.infer<
  typeof createInterlineAgreementSchema
>;

/** Query for the directional interline resolver (/prd/flights/13-mct-rules.md §A2). */
export const resolveInterlineQuerySchema = z.object({
  inboundAirline: airlineCodeSchema,
  outboundAirline: airlineCodeSchema,
});
export type ResolveInterlineQuery = z.infer<typeof resolveInterlineQuerySchema>;

/**
 * Result of the interline resolver — same shape the Step 8 classifier
 * consumes directly (`InterlineResolution` in /prd/flights/13-mct-rules.md §B).
 */
export const interlineResolutionSchema = z.object({
  online: z.boolean(),
  permitted: z.boolean(),
  bagThroughChecked: z.boolean(),
  agreementId: ulidSchema.nullable(),
});
export type InterlineResolution = z.infer<typeof interlineResolutionSchema>;

/** The four DERIVED gap types plus 'invalid' — never stored, always computed. See /prd/flights/01-glossary.md. */
export const connectionKindSchema = z.enum([
  'connection',
  'stopover',
  'open_jaw',
  'transit',
  'invalid',
]);
export type ConnectionKind = z.infer<typeof connectionKindSchema>;

/**
 * Output of the connection-validation classifier (/prd/flights/13-mct-rules.md §B).
 * `gapMinutes` is null for open_jaw/transit, and for invalid/NO_INTERLINE
 * (the interline gate runs before gap math) and invalid/NO_INTERLINE only.
 */
export const connectionResultSchema = z.object({
  prevFlightId: ulidSchema,
  nextFlightId: ulidSchema,
  kind: connectionKindSchema,
  gapMinutes: z.number().int().nullable(),
  sameMetroInterAirport: z.boolean(),
  isInterline: z.boolean(),
  bagThroughChecked: z.boolean(),
  appliedMctRuleId: ulidSchema.nullable(),
  appliedInterlineId: ulidSchema.nullable(),
  reason: z.string(),
});
export type ConnectionResult = z.infer<typeof connectionResultSchema>;

/**
 * One OTA-style search result: a direct flight (1 leg) or a one-stop
 * itinerary (2 legs) gated by ConnectionsService.classify() — see
 * /prd/flights/CONTEXT.md Step 11. `connections` has length `flights.length - 1`.
 */
export const flightItinerarySchema = z.object({
  flights: z.array(flightSchema).min(1).max(2),
  connections: z.array(connectionResultSchema),
  stopCount: z.number().int().nonnegative(),
  totalPrice: z.number().nonnegative(),
  currency: currencyCodeSchema,
  departureTime: offsetDateTimeSchema,
  arrivalTime: offsetDateTimeSchema,
  totalDurationMinutes: z.number().int().nonnegative(),
});
export type FlightItinerary = z.infer<typeof flightItinerarySchema>;

export const validateConnectionSchema = z.object({
  prevFlightId: ulidSchema,
  nextFlightId: ulidSchema,
});
export type ValidateConnectionInput = z.infer<typeof validateConnectionSchema>;

export const validateConnectionChainSchema = z.object({
  flightIds: z.array(ulidSchema).min(2),
});
export type ValidateConnectionChainInput = z.infer<
  typeof validateConnectionChainSchema
>;

export const sessionUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  image: z.string().nullish(),
  emailVerified: z.boolean(),
  role: z.string().nullish(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type SessionUser = z.infer<typeof sessionUserSchema>;

export const meResponseSchema = z.object({
  user: sessionUserSchema,
});
export type MeResponse = z.infer<typeof meResponseSchema>;

/**
 * Hotel search domain — see /prd/hotels/11-data-model.md and
 * /prd/hotels/13-resolver-and-search.md. Money is always integer minor units
 * + an ISO currency code — never a bare number, never a float.
 */
export const moneySchema = z.object({
  amount: z.number().int(),
  currency: currencyCodeSchema,
});
export type Money = z.infer<typeof moneySchema>;

export const propertyTypeSchema = z.enum(['hotel', 'apartment', 'house']);
export type PropertyType = z.infer<typeof propertyTypeSchema>;

export const hotelPriceBreakdownSchema = z.object({
  perNight: moneySchema,
  nights: z.number().int().positive(),
  total: moneySchema,
});
export type HotelPriceBreakdown = z.infer<typeof hotelPriceBreakdownSchema>;

export const hotelSearchQuerySchema = z.object({
  destination: z.string().min(1),
  checkIn: z.iso.date(),
  checkOut: z.iso.date(),
  occupancy: z.coerce.number().int().min(1),
  currency: currencyCodeSchema,
  roomType: z.string().optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  sort: z
    .enum(['price_asc', 'price_desc', 'name'])
    .optional()
    .default('price_asc'),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});
export type HotelSearchQuery = z.infer<typeof hotelSearchQuerySchema>;

export const hotelSearchResultSchema = z.object({
  propertyCode: z.string(),
  displayName: z.string(),
  destination: z.string(),
  heroImageUrl: z.string().nullable(),
  price: moneySchema,
  nativePrice: moneySchema,
  breakdown: hotelPriceBreakdownSchema,
  starRating: z.number().int().min(1).max(5).nullable().optional(),
});
export type HotelSearchResult = z.infer<typeof hotelSearchResultSchema>;

export const hotelSearchResponseSchema = z.object({
  items: z.array(hotelSearchResultSchema),
  total: z.number().int().nonnegative(),
});
export type HotelSearchResponse = z.infer<typeof hotelSearchResponseSchema>;

/**
 * Hotel catalog admin — CRUD contracts for the manageable entities
 * (packages/db/src/schema/app.ts). Most hotel tables have no
 * created_at/updated_at columns — don't add them here just to match other
 * domains' shape.
 */

export const currencySchema = z.object({
  code: currencyCodeSchema,
  minorUnit: z.number().int().min(0).max(6),
  symbol: z.string().min(1).max(10),
  name: z.string().min(1).max(100),
});
export type Currency = z.infer<typeof currencySchema>;

export const createCurrencySchema = currencySchema;
export type CreateCurrencyInput = z.infer<typeof createCurrencySchema>;

export const updateCurrencySchema = createCurrencySchema
  .omit({ code: true })
  .partial();
export type UpdateCurrencyInput = z.infer<typeof updateCurrencySchema>;

export const fxRateSchema = z.object({
  id: ulidSchema,
  baseCurrency: currencyCodeSchema,
  quoteCurrency: currencyCodeSchema,
  /** rate x 1_000_000 (parts per million) — see /prd/hotels/13-resolver-and-search.md. */
  ratePpm: z.number().int().positive(),
  asOf: z.iso.datetime(),
});
export type FxRate = z.infer<typeof fxRateSchema>;

export const createFxRateSchema = z.object({
  baseCurrency: currencyCodeSchema,
  quoteCurrency: currencyCodeSchema,
  ratePpm: z.number().int().positive(),
  asOf: z.iso.datetime(),
});
export type CreateFxRateInput = z.infer<typeof createFxRateSchema>;

export const updateFxRateSchema = createFxRateSchema.partial();
export type UpdateFxRateInput = z.infer<typeof updateFxRateSchema>;

export const propertySchema = z.object({
  propertyCode: z.string().min(1).max(50),
  type: propertyTypeSchema,
  starRating: z.number().int().min(1).max(5).nullable(),
  address: z.string().nullable(),
  displayName: z.string().min(1).max(200),
  destination: z.string().min(1).max(100),
  countryCode: z.string().length(2),
  heroImageUrl: z.string().nullable(),
  /** Approx. distance in meters to the property's relevant landmark (e.g. Masjid Al-Haram / An-Nabawi). */
  distanceMeters: z.number().int().nonnegative().nullable(),
  /** Free-text qualifier for distanceMeters, e.g. "Shuttle", "2 min walk", "Front row". */
  distanceNote: z.string().nullable(),
  contactPhone: z.string().nullable(),
  contactEmail: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.iso.datetime(),
});
export type Property = z.infer<typeof propertySchema>;

export const createPropertySchema = z.object({
  propertyCode: z.string().min(1).max(50),
  type: propertyTypeSchema,
  starRating: z.number().int().min(1).max(5).optional(),
  address: z.string().max(500).optional(),
  displayName: z.string().min(1).max(200),
  destination: z.string().min(1).max(100),
  countryCode: z.string().length(2),
  heroImageUrl: z.string().max(2000).optional(),
  distanceMeters: z.number().int().nonnegative().optional(),
  distanceNote: z.string().max(200).optional(),
  contactPhone: z.string().max(50).optional(),
  contactEmail: z.email().max(200).optional(),
  isActive: z.boolean().optional(),
});
export type CreatePropertyInput = z.infer<typeof createPropertySchema>;

export const updatePropertySchema = createPropertySchema
  .omit({ propertyCode: true })
  .partial();
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;

export const roomTypeSchema = z.object({
  id: ulidSchema,
  propertyCode: z.string(),
  name: z.string().min(1).max(100),
  maxOccupancy: z.number().int().positive(),
});
export type RoomType = z.infer<typeof roomTypeSchema>;

export const createRoomTypeSchema = z.object({
  propertyCode: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  maxOccupancy: z.number().int().positive(),
});
export type CreateRoomTypeInput = z.infer<typeof createRoomTypeSchema>;

export const updateRoomTypeSchema = createRoomTypeSchema
  .omit({ propertyCode: true })
  .partial();
export type UpdateRoomTypeInput = z.infer<typeof updateRoomTypeSchema>;

/** Label only — the date window on `season` is what actually selects it. */
export const seasonNameSchema = z.enum([
  'standard',
  'peak',
  'ramadan',
  'hajj',
  'promo',
]);
export type SeasonName = z.infer<typeof seasonNameSchema>;

export const seasonSchema = z.object({
  id: ulidSchema,
  propertyCode: z.string(),
  name: seasonNameSchema,
  startDate: z.iso.date(),
  endDate: z.iso.date(),
});
export type Season = z.infer<typeof seasonSchema>;

export const createSeasonSchema = z.object({
  propertyCode: z.string().min(1).max(50),
  name: seasonNameSchema,
  startDate: z.iso.date(),
  endDate: z.iso.date(),
});
export type CreateSeasonInput = z.infer<typeof createSeasonSchema>;

export const updateSeasonSchema = createSeasonSchema
  .omit({ propertyCode: true })
  .partial();
export type UpdateSeasonInput = z.infer<typeof updateSeasonSchema>;

export const rateRuleSchema = z.object({
  id: ulidSchema,
  propertyCode: z.string(),
  /** Null = the Standard (base) rate — applies when no dated season covers the stay. */
  seasonId: ulidSchema.nullable(),
  roomTypeId: ulidSchema,
  minOccupancy: z.number().int().positive(),
  maxOccupancy: z.number().int().positive(),
  /** Minor units, always per-night. */
  amount: z.number().int().nonnegative(),
  currency: currencyCodeSchema,
});
export type RateRule = z.infer<typeof rateRuleSchema>;

export const createRateRuleSchema = z.object({
  propertyCode: z.string().min(1).max(50),
  /** Omit for the Standard (season-less) base rate. */
  seasonId: ulidSchema.optional(),
  roomTypeId: ulidSchema,
  minOccupancy: z.number().int().positive(),
  maxOccupancy: z.number().int().positive(),
  amount: z.number().int().nonnegative(),
  currency: currencyCodeSchema,
});
export type CreateRateRuleInput = z.infer<typeof createRateRuleSchema>;

export const updateRateRuleSchema = createRateRuleSchema
  .omit({ propertyCode: true })
  .partial();
export type UpdateRateRuleInput = z.infer<typeof updateRateRuleSchema>;

/**
 * An umrah/hajj catalog product: a specific flight paired with one or more
 * ordered city stays (Makkah + Madinah, plus a third city for umrah_plus),
 * a flat price, and a display program — NOT a booking (no fares/PNR/seats;
 * occupancy pricing and real inventory stay out). See
 * prd/travel-packages/00-overview.md for the scope decision. The response is
 * enriched so the public card list renders without N follow-up requests.
 */
export const travelPackageTypeSchema = z.enum(['umrah', 'umrah_plus', 'hajj']);
export const travelPackageMealPlanSchema = z.enum([
  'full_board',
  'half_board',
  'room_only',
]);
export const travelPackageInclusionKindSchema = z.enum([
  'included',
  'excluded',
]);

const flightHotelPackageFlightSummarySchema = z.object({
  id: ulidSchema,
  operatingAirline: airlineCodeSchema,
  airlineName: z.string(),
  flightNumber: flightNumberSchema,
  originAirport: airportCodeSchema,
  destAirport: airportCodeSchema,
  departureTime: offsetDateTimeSchema,
  arrivalTime: offsetDateTimeSchema,
  /** False when the operating flight has an internal technical stop (see /prd/flights/01-glossary.md — "transit", not a cross-flight connection). */
  isDirect: z.boolean(),
  transitAirport: airportCodeSchema.nullable(),
  transitCityName: z.string().nullable(),
});

/** One ordered city stay, enriched with the property's display details. */
const travelPackageStaySummarySchema = z.object({
  propertyCode: z.string(),
  displayName: z.string(),
  destination: z.string(),
  starRating: z.number().int().min(1).max(5).nullable(),
  distanceMeters: z.number().int().nonnegative().nullable(),
  distanceNote: z.string().nullable(),
  sequence: z.number().int().positive(),
  nights: z.number().int().positive(),
});

const travelPackageDepartureSchema = z.object({
  id: ulidSchema,
  departureDate: z.iso.date(),
  returnDate: z.iso.date().nullable(),
  seatsNote: z.string().nullable(),
  /** Seat quota for this departure; null = quota not tracked (unlimited). */
  totalSeats: z.number().int().nonnegative().nullable(),
  /** Sum of pax across `confirmed` bookings — computed, never stored directly. */
  bookedSeats: z.number().int().nonnegative(),
  /** `totalSeats - bookedSeats` when a quota is set; null when untracked. Aggregate only — individual booking rows (with customer PII) are served by the admin-only bookings endpoint. */
  remainingSeats: z.number().int().nullable(),
});

const travelPackageInclusionSchema = z.object({
  kind: travelPackageInclusionKindSchema,
  label: z.string(),
});

const travelPackageItineraryDaySchema = z.object({
  dayNumber: z.number().int().positive(),
  title: z.string(),
  description: z.string().nullable(),
});

export const flightHotelPackageSchema = z.object({
  id: ulidSchema,
  type: travelPackageTypeSchema,
  title: z.string().min(1).max(200),
  description: z.string().nullable(),
  heroImageUrl: z.string().nullable(),
  flyerUrl: z.string().nullable(),
  /** The umrah travel company that organizes this package (one per package). */
  providerId: ulidSchema.nullable(),
  /** Provider display name, joined at read time. */
  providerName: z.string().nullable(),
  /** Flat commission the agent earns per pax sold, in the package `currency`. */
  feePerSeat: z.number().nonnegative().nullable(),
  price: z.number().nonnegative(),
  currency: currencyCodeSchema,
  durationNights: z.number().int().positive(),
  mealPlan: travelPackageMealPlanSchema.nullable(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  flight: flightHotelPackageFlightSummarySchema,
  stays: z.array(travelPackageStaySummarySchema),
  departures: z.array(travelPackageDepartureSchema),
  inclusions: z.array(travelPackageInclusionSchema),
  itinerary: z.array(travelPackageItineraryDaySchema),
});
export type FlightHotelPackage = z.infer<typeof flightHotelPackageSchema>;

export const flightHotelPackageListSchema = z.array(flightHotelPackageSchema);

// Write shapes: flat FK/scalar values only (no enriched summaries). Nights per
// stay must sum to durationNights — validated server-side, not here.
const createTravelPackageStaySchema = z.object({
  propertyCode: z.string().min(1).max(50),
  sequence: z.number().int().positive(),
  nights: z.number().int().positive(),
});

const createTravelPackageDepartureSchema = z.object({
  /** Present when editing an existing departure — the write path upserts by id so booking rows keyed to it survive. Omit for a new departure. */
  id: ulidSchema.optional(),
  departureDate: z.iso.date(),
  returnDate: z.iso.date().optional(),
  seatsNote: z.string().max(200).optional(),
  totalSeats: z.number().int().nonnegative().optional(),
});

const createTravelPackageInclusionSchema = z.object({
  kind: travelPackageInclusionKindSchema,
  label: z.string().min(1).max(200),
});

const createTravelPackageItineraryDaySchema = z.object({
  dayNumber: z.number().int().positive(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
});

export const createFlightHotelPackageSchema = z.object({
  type: travelPackageTypeSchema,
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  flightId: ulidSchema,
  durationNights: z.number().int().positive(),
  mealPlan: travelPackageMealPlanSchema.optional(),
  heroImageUrl: z.string().max(2000).optional(),
  flyerUrl: z.string().max(2000).optional(),
  providerId: ulidSchema.optional(),
  feePerSeat: z.number().nonnegative().optional(),
  price: z.number().nonnegative(),
  currency: currencyCodeSchema,
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  stays: z.array(createTravelPackageStaySchema).min(1),
  departures: z.array(createTravelPackageDepartureSchema).optional(),
  inclusions: z.array(createTravelPackageInclusionSchema).optional(),
  itinerary: z.array(createTravelPackageItineraryDaySchema).optional(),
});
export type CreateFlightHotelPackageInput = z.infer<
  typeof createFlightHotelPackageSchema
>;

export const updateFlightHotelPackageSchema =
  createFlightHotelPackageSchema.partial();
export type UpdateFlightHotelPackageInput = z.infer<
  typeof updateFlightHotelPackageSchema
>;

/**
 * Back-office seat inventory: a booking is a reservation record staff enter
 * against a specific departure. Confirmed pax count against the departure's
 * `totalSeats` quota; the server rejects a booking that would overbook. This is
 * an admin-only operational surface — never exposed on the anonymous public
 * package list (individual rows carry customer PII). See
 * prd/travel-packages/11-data-model.md.
 */
export const travelPackageBookingStatusSchema = z.enum([
  'confirmed',
  'cancelled',
]);
export type TravelPackageBookingStatus = z.infer<
  typeof travelPackageBookingStatusSchema
>;

export const travelPackageBookingSchema = z.object({
  id: ulidSchema,
  departureId: ulidSchema,
  customerName: z.string().min(1).max(200),
  pax: z.number().int().positive(),
  phone: z.string().nullable(),
  notes: z.string().nullable(),
  status: travelPackageBookingStatusSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type TravelPackageBooking = z.infer<typeof travelPackageBookingSchema>;

export const travelPackageBookingListSchema = z.array(
  travelPackageBookingSchema,
);

export const createTravelPackageBookingSchema = z.object({
  departureId: ulidSchema,
  customerName: z.string().min(1).max(200),
  pax: z.number().int().positive(),
  phone: z.string().max(50).optional(),
  notes: z.string().max(1000).optional(),
  status: travelPackageBookingStatusSchema.optional(),
});
export type CreateTravelPackageBookingInput = z.infer<
  typeof createTravelPackageBookingSchema
>;

// departureId is fixed at creation — a booking cannot be moved between
// departures (that is a cancel + re-book), so it is omitted from the update shape.
export const updateTravelPackageBookingSchema = createTravelPackageBookingSchema
  .omit({ departureId: true })
  .partial();
export type UpdateTravelPackageBookingInput = z.infer<
  typeof updateTravelPackageBookingSchema
>;

/** Result of a file upload: the absolute URL the stored file is served from. */
export const uploadResultSchema = z.object({
  url: z.string(),
});
export type UploadResult = z.infer<typeof uploadResultSchema>;

/**
 * An umrah travel company (operator) the agent markets packages for. Each
 * travel_package references one provider; the agent earns a per-seat commission
 * (`feePerSeat` on the package) on every confirmed booking of that package.
 */
export const travelProviderSchema = z.object({
  id: ulidSchema,
  name: z.string().min(1).max(200),
  /** e.g. the Kemenag PPIU licence number. */
  licenseNumber: z.string().nullable(),
  contactPhone: z.string().nullable(),
  contactEmail: z.string().nullable(),
  website: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type TravelProvider = z.infer<typeof travelProviderSchema>;

export const travelProviderListSchema = z.array(travelProviderSchema);

export const createTravelProviderSchema = z.object({
  name: z.string().min(1).max(200),
  licenseNumber: z.string().max(100).optional(),
  contactPhone: z.string().max(50).optional(),
  contactEmail: z.string().max(200).optional(),
  website: z.string().max(2000).optional(),
  isActive: z.boolean().optional(),
});
export type CreateTravelProviderInput = z.infer<
  typeof createTravelProviderSchema
>;

export const updateTravelProviderSchema = createTravelProviderSchema.partial();
export type UpdateTravelProviderInput = z.infer<
  typeof updateTravelProviderSchema
>;

/**
 * Agent commission earned, aggregated from CONFIRMED bookings and grouped by
 * provider + currency: totalEarned = Σ (booking.pax × package.feePerSeat).
 * Grouped by currency too, since a provider's packages may be priced differently.
 */
export const travelPackageEarningsRowSchema = z.object({
  providerId: ulidSchema,
  providerName: z.string(),
  currency: currencyCodeSchema,
  packageCount: z.number().int().nonnegative(),
  bookingCount: z.number().int().nonnegative(),
  paxCount: z.number().int().nonnegative(),
  totalEarned: z.number().nonnegative(),
});
export type TravelPackageEarningsRow = z.infer<
  typeof travelPackageEarningsRowSchema
>;

export const travelPackageEarningsSchema = z.array(
  travelPackageEarningsRowSchema,
);
