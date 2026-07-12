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

/** IATA airport code: 3 uppercase letters (JFK, NRT). */
export const airportCodeSchema = z
  .string()
  .regex(/^[A-Z]{3}$/, 'Invalid IATA airport code');

/** IATA airline code: 2 uppercase alphanumerics (GA, NH, 5J). */
export const airlineCodeSchema = z
  .string()
  .regex(/^[A-Z0-9]{2}$/, 'Invalid IATA airline code');

export const airportSchema = z.object({
  airportCode: airportCodeSchema,
  icaoCode: z.string().length(4).nullable(),
  name: z.string(),
  cityCode: z.string().length(3),
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
  cityCode: z.string().length(3),
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
  /** Omit for a single-leg flight (auto-creates one FULL leg). Provide >=2 for a technical stop. */
  legs: z.array(createFlightLegInputSchema).min(2).optional(),
});
export type CreateFlightInput = z.infer<typeof createFlightSchema>;

export const updateFlightSchema = z.object({
  aircraftType: z.string().max(10).optional(),
  status: flightStatusSchema.optional(),
});
export type UpdateFlightInput = z.infer<typeof updateFlightSchema>;

/**
 * A sellable/displayable identity mapped onto an operating flight
 * (`flights`). Codeshare = many marketing rows -> one operating flight; see
 * /prd/01-glossary.md.
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

/** Domestic/international combination at the connection airport; see /prd/13-mct-rules.md §A. */
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

/** Query for the most-specific-first resolver (/prd/13-mct-rules.md §A). */
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
 * See /prd/01-glossary.md (codeshare vs interline) and /prd/13-mct-rules.md §A2.
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

/** Query for the directional interline resolver (/prd/13-mct-rules.md §A2). */
export const resolveInterlineQuerySchema = z.object({
  inboundAirline: airlineCodeSchema,
  outboundAirline: airlineCodeSchema,
});
export type ResolveInterlineQuery = z.infer<typeof resolveInterlineQuerySchema>;

/**
 * Result of the interline resolver — same shape the Step 8 classifier
 * consumes directly (`InterlineResolution` in /prd/13-mct-rules.md §B).
 */
export const interlineResolutionSchema = z.object({
  online: z.boolean(),
  permitted: z.boolean(),
  bagThroughChecked: z.boolean(),
  agreementId: ulidSchema.nullable(),
});
export type InterlineResolution = z.infer<typeof interlineResolutionSchema>;

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
