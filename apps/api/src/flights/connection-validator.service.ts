import { Inject, Injectable } from '@nestjs/common';
import type { Database } from '@repo/db';
import { schema } from '@repo/db';
import { Flight } from '@repo/shared';
import { and, eq } from 'drizzle-orm';
import { DATABASE } from '../database/database.module';

@Injectable()
export class ConnectionValidatorService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  /**
   * Validates if two flights form a legal connection.
   */
  async validateConnection(flight1: Flight, flight2: Flight): Promise<boolean> {
    // 1. Basic continuity check
    if (flight1.destAirport !== flight2.originAirport) {
      return false; // Inter-airport connections (like HND->NRT) omitted for simplicity
    }

    const _transferAirport = flight1.destAirport;

    // 2. Interline check
    if (flight1.operatingAirline !== flight2.operatingAirline) {
      const agreements = await this.db
        .select()
        .from(schema.interlineAgreements)
        .where(
          and(
            eq(
              schema.interlineAgreements.inboundAirline,
              flight1.operatingAirline,
            ),
            eq(
              schema.interlineAgreements.outboundAirline,
              flight2.operatingAirline,
            ),
          ),
        );

      if (agreements.length === 0) {
        return false; // No interline agreement
      }
    }

    // 3. Time gap check (MCT)
    const rules = await this.db
      .select()
      .from(schema.mctRules)
      .where(
        and(
          eq(schema.mctRules.arrivalAirport, flight1.destAirport),
          eq(schema.mctRules.departureAirport, flight2.originAirport),
        ),
      );

    // Fallbacks if no specific rule is found
    let mct = 60;
    let maxConn = 24 * 60;
    if (rules.length > 0) {
      mct = rules[0].mctMinutes;
      maxConn = rules[0].maxConnectionMinutes ?? 24 * 60;
    }

    const t1 = this.parseLocalTime(flight1.arrivalTimeLocal);
    const t2 = this.parseLocalTime(flight2.departureTimeLocal);

    let gap = t2 - t1;
    // If the gap is less than the Minimum Connection Time (MCT),
    // we assume the passenger takes this flight on the NEXT calendar day.
    if (gap < mct) {
      gap += 24 * 60;
    }

    return gap >= mct && gap <= maxConn;
  }

  private parseLocalTime(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
