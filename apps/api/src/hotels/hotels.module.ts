/**
 * Scope: read-only hotel search. A request carries a destination, a date range,
 * an occupancy and a display currency; the response is a ranked list of
 * properties, each priced for exactly those inputs. `GET /hotels/search` is the
 * whole surface — there is deliberately no other verb and no get-by-id route
 * (the web detail page re-runs the search and matches client-side, which is why
 * it carries the search inputs as query params). Catalog writes live in the
 * sibling hotel-{properties,room-types,seasons,season-windows,rate-rules,
 * currencies,fx-rates} admin modules, not here.
 *
 * Not in scope — absent on purpose, not unbuilt:
 * - Booking, cart, hold, or payment. This is the hard wall for this domain.
 *   (The travel-packages domain does track back-office bookings; that is a
 *   separate domain and does not extend to hotels.)
 * - Inventory or availability. A price is shown regardless of whether rooms
 *   remain; availability is not modeled anywhere in the schema.
 * - External pricing APIs. Prices are seeded and admin-managed. The schema is
 *   API-ready (native currency per rate rule) but no integration exists.
 * - Reviews, ratings, and any media pipeline — a single `hero_image_url`
 *   string is the ceiling.
 *
 * Search is session-gated by the repo's global AuthGuard, with no
 * `@AllowAnonymous()` anywhere — deliberate, and the opposite of the
 * travel-packages public list. Pages live under both `@admin` and `@user`.
 */
import { Module } from '@nestjs/common';
import { HotelsController } from './hotels.controller';
import { HotelsService } from './hotels.service';

@Module({
  controllers: [HotelsController],
  providers: [HotelsService],
})
export class HotelsModule {}
