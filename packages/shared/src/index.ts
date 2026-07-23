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

/** IATA flight number: 1-4 digits with an optional trailing letter (e.g. '10', '874'). */
export const flightNumberSchema = z
  .string()
  .regex(/^[0-9]{1,4}[A-Z]?$/, 'Invalid flight number');

/** Local time string: HH:MM (e.g. '10:45'). */
export const localTimeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid local time (HH:MM)');

/**
 * One physical hop of a flight. Legs exist ONLY to describe a technical stop —
 * a nonstop flight has no leg rows, and its route/times live on the flight
 * itself. A leg per flight would be a stored copy of derived data.
 */
export const flightLegSchema = z.object({
  id: ulidSchema,
  flightId: ulidSchema,
  legSequence: z.number().int().min(1),
  depAirport: airportCodeSchema,
  arrAirport: airportCodeSchema,
  departureTimeLocal: localTimeSchema,
  arrivalTimeLocal: localTimeSchema,
  departureDayOffset: z.number().int(),
  arrivalDayOffset: z.number().int(),
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
  departureTimeLocal: localTimeSchema,
  arrivalTimeLocal: localTimeSchema,
  arrivalDayOffset: z.number().int(),
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
  depAirport: airportCodeSchema,
  arrAirport: airportCodeSchema,
  departureTimeLocal: localTimeSchema,
  arrivalTimeLocal: localTimeSchema,
  departureDayOffset: z.number().int().optional().default(0),
  arrivalDayOffset: z.number().int().optional().default(0),
});
export type CreateFlightLegInput = z.infer<typeof createFlightLegInputSchema>;

export const createFlightSchema = z.object({
  operatingAirline: airlineCodeSchema,
  flightNumber: flightNumberSchema,
  originAirport: airportCodeSchema,
  destAirport: airportCodeSchema,
  departureTimeLocal: localTimeSchema,
  arrivalTimeLocal: localTimeSchema,
  arrivalDayOffset: z.number().int().optional().default(0),
  aircraftType: z.string().max(10).optional(),
  status: flightStatusSchema.optional(),
  price: z.number().nonnegative(),
  currency: currencyCodeSchema,
  /** Omit for a nonstop flight (no leg rows). Provide >=2 only for a technical stop. */
  legs: z.array(createFlightLegInputSchema).min(2).optional(),
});
export type CreateFlightInput = z.infer<typeof createFlightSchema>;

/**
 * Update accepts the full editable schedule — route, times, day offset, legs,
 * and attributes — everything except the immutable identity keys (operating
 * airline + flight number), which are fixed at creation. Like create, omitting
 * `legs` means nonstop and clears any existing leg rows.
 */
export const updateFlightSchema = createFlightSchema.omit({
  operatingAirline: true,
  flightNumber: true,
});
export type UpdateFlightInput = z.infer<typeof updateFlightSchema>;

/** Query for the OTA-style search endpoint — matches on route + UTC calendar day of departure. */
export const searchFlightsQuerySchema = z.object({
  originAirport: airportCodeSchema,
  destAirport: airportCodeSchema,
  // Flights are schedule templates, so search is date-agnostic; the field is
  // kept optional for callers that still scope by a display date.
  date: z.iso.date().optional(),
});
export type SearchFlightsQuery = z.infer<typeof searchFlightsQuerySchema>;

/**
 * A sellable/displayable identity mapped onto an operating flight
 * (`flights`). Codeshare = many marketing rows -> one operating flight.
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

/**
 * Directional carrier-pair gate: does the inbound operating carrier permit a
 * through-ticketed interline connection onto the outbound operating carrier?
 * Distinct from codeshare: codeshare is one flight's many marketing identities;
 * interline is permission to connect two carriers' flights under one ticket.
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

/** Query for the directional interline resolver. */
export const resolveInterlineQuerySchema = z.object({
  inboundAirline: airlineCodeSchema,
  outboundAirline: airlineCodeSchema,
});
export type ResolveInterlineQuery = z.infer<typeof resolveInterlineQuerySchema>;

/**
 * Result of the interline resolver — the shape `ConnectionsService.classify()`
 * consumes directly.
 */
export const interlineResolutionSchema = z.object({
  online: z.boolean(),
  permitted: z.boolean(),
  bagThroughChecked: z.boolean(),
  agreementId: ulidSchema.nullable(),
});
export type InterlineResolution = z.infer<typeof interlineResolutionSchema>;

/**
 * One OTA-style search result: a direct flight (1 leg) or a one-stop
 * itinerary (2 legs).
 */
export const flightItinerarySchema = z.object({
  flights: z.array(flightSchema).min(1).max(3),
  stopCount: z.number().int().nonnegative(),
  totalPrice: z.number().nonnegative(),
  currency: currencyCodeSchema,
  departureTimeLocal: localTimeSchema,
  arrivalTimeLocal: localTimeSchema,
  arrivalDayOffset: z.number().int().nonnegative(),
  totalDurationMinutes: z.number().int().nonnegative(),
});
export type FlightItinerary = z.infer<typeof flightItinerarySchema>;

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
 * Hotel search domain. Money is always integer minor units + an ISO currency
 * code — never a bare number, never a float. This is intentionally stricter
 * than the flights domain's `numeric(10,2)` price column: hotels convert
 * between currencies, and decimal/float rounding drift that a single-currency
 * domain never notices compounds across an FX conversion.
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
  /**
   * rate x 1_000_000 (parts per million) — an integer so the rate itself never
   * introduces float drift. It multiplies MAJOR units, not minor ones; see
   * applyFx() in apps/api/src/hotels/money.ts for the de-scale/re-scale step.
   */
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
  propertyCode: z.string().length(26),
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

export const updatePropertySchema = createPropertySchema.partial();
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;

// Room types are global reference data — a shared catalog of room categories,
// not scoped to any property. `maxOccupancy` is the category default.
export const roomTypeSchema = z.object({
  id: ulidSchema,
  name: z.string().min(1).max(100),
  maxOccupancy: z.number().int().positive(),
});
export type RoomType = z.infer<typeof roomTypeSchema>;

export const createRoomTypeSchema = z.object({
  name: z.string().min(1).max(100),
  maxOccupancy: z.number().int().positive(),
});
export type CreateRoomTypeInput = z.infer<typeof createRoomTypeSchema>;

export const updateRoomTypeSchema = createRoomTypeSchema.partial();
export type UpdateRoomTypeInput = z.infer<typeof updateRoomTypeSchema>;

/** Global season label. The dated window that selects it lives on `season_window`. */
export const seasonNameSchema = z.string().min(1).max(50);
export type SeasonName = z.infer<typeof seasonNameSchema>;

// Seasons are global reference data — a shared catalog of season labels. The
// per-property dated window that maps a stay to a season is `seasonWindow`.
export const seasonSchema = z.object({
  id: ulidSchema,
  name: seasonNameSchema,
});
export type Season = z.infer<typeof seasonSchema>;

export const createSeasonSchema = z.object({
  name: seasonNameSchema,
});
export type CreateSeasonInput = z.infer<typeof createSeasonSchema>;

export const updateSeasonSchema = createSeasonSchema.partial();
export type UpdateSeasonInput = z.infer<typeof updateSeasonSchema>;

// A per-property dated window that maps a stay date to a global season.
export const seasonWindowSchema = z.object({
  id: ulidSchema,
  propertyCode: z.string(),
  seasonId: ulidSchema,
  startDate: z.iso.date(),
  endDate: z.iso.date(),
});
export type SeasonWindow = z.infer<typeof seasonWindowSchema>;

export const createSeasonWindowSchema = z.object({
  propertyCode: z.string().min(1).max(50),
  seasonId: ulidSchema,
  startDate: z.iso.date(),
  endDate: z.iso.date(),
});
export type CreateSeasonWindowInput = z.infer<typeof createSeasonWindowSchema>;

export const updateSeasonWindowSchema = createSeasonWindowSchema
  .omit({ propertyCode: true })
  .partial();
export type UpdateSeasonWindowInput = z.infer<typeof updateSeasonWindowSchema>;

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
  departureTimeLocal: localTimeSchema,
  arrivalTimeLocal: localTimeSchema,
  arrivalDayOffset: z.number().int(),
  /** False when the operating flight has an internal technical stop — that is a "transit", not a cross-flight connection. */
  isDirect: z.boolean(),
  transitAirport: airportCodeSchema.nullable(),
  transitCityName: z.string().nullable(),
});

/** One ordered city stay, enriched with the property's display details. */
const travelPackageStaySummarySchema = z.object({
  cityCode: cityCodeSchema,
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
  outboundFlights: z.array(flightHotelPackageFlightSummarySchema),
  inboundFlights: z.array(flightHotelPackageFlightSummarySchema),
  departureDate: z.iso.date(),
  returnDate: z.iso.date().nullable(),
  seatsNote: z.string().nullable(),
  /** Seat quota for this departure; null = quota not tracked (unlimited). */
  totalSeats: z.number().int().nonnegative().nullable(),
  /** The true available pool, manually synced with the provider. */
  availableSeats: z.number().int().nonnegative().nullable(),
  price: z.number().nonnegative(),
  currency: currencyCodeSchema,
  /** Sum of pax across `confirmed` bookings — computed, never stored directly. */
  bookedSeats: z.number().int().nonnegative(),
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
  cityCode: cityCodeSchema,
  propertyCode: z.string().min(1).max(50),
  sequence: z.number().int().positive(),
  nights: z.number().int().positive(),
});

const createTravelPackageDepartureSchema = z.object({
  departureDate: z.iso.date(),
  /** Present when editing an existing departure — the write path upserts by id so booking rows keyed to it survive. Omit for a new departure. */
  id: ulidSchema.optional(),
  outboundFlightIds: z.array(ulidSchema).min(1),
  inboundFlightIds: z.array(ulidSchema).optional(),
  returnDate: z.iso.date().optional(),
  seatsNote: z.string().max(200).optional(),
  totalSeats: z.number().int().nonnegative().optional(),
  availableSeats: z.number().int().nonnegative().optional(),
  price: z.number().nonnegative(),
  currency: currencyCodeSchema,
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
