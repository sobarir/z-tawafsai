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
  CreateInterlineAgreementInput,
  InterlineAgreement,
  InterlineResolution,
} from '@repo/shared';
import { and, eq } from 'drizzle-orm';
import { DATABASE } from '../database/database.module';

type InterlineAgreementRow = typeof schema.interlineAgreements.$inferSelect;

const toInterlineAgreement = (
  row: InterlineAgreementRow,
): InterlineAgreement => ({
  ...row,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

@Injectable()
export class InterlineAgreementsService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async list(): Promise<InterlineAgreement[]> {
    const rows = await this.db.select().from(schema.interlineAgreements);
    return rows.map(toInterlineAgreement);
  }

  async findById(id: string): Promise<InterlineAgreement> {
    const [row] = await this.db
      .select()
      .from(schema.interlineAgreements)
      .where(eq(schema.interlineAgreements.id, id));
    if (!row) {
      throw new NotFoundException(`Interline agreement ${id} not found`);
    }
    return toInterlineAgreement(row);
  }

  async create(
    input: CreateInterlineAgreementInput,
  ): Promise<InterlineAgreement> {
    if (input.inboundAirline === input.outboundAirline) {
      throw new BadRequestException(
        'inboundAirline and outboundAirline must differ — a carrier is always online with itself',
      );
    }

    const [existing] = await this.db
      .select({ id: schema.interlineAgreements.id })
      .from(schema.interlineAgreements)
      .where(
        and(
          eq(schema.interlineAgreements.inboundAirline, input.inboundAirline),
          eq(schema.interlineAgreements.outboundAirline, input.outboundAirline),
        ),
      );
    if (existing) {
      throw new ConflictException(
        `Interline agreement ${input.inboundAirline}->${input.outboundAirline} already exists`,
      );
    }

    const [created] = await this.db
      .insert(schema.interlineAgreements)
      .values(input)
      .returning();
    return toInterlineAgreement(created);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.db
      .delete(schema.interlineAgreements)
      .where(eq(schema.interlineAgreements.id, id));
  }

  /**
   * operationId: resolveInterline. Same operating carrier -> online, no
   * lookup. Otherwise a directional (inbound, outbound) lookup; absence is a
   * valid result (not permitted), not a 404.
   */
  async resolveInterline(
    inboundAirline: string,
    outboundAirline: string,
  ): Promise<InterlineResolution> {
    if (inboundAirline === outboundAirline) {
      return {
        online: true,
        permitted: true,
        bagThroughChecked: true,
        agreementId: null,
      };
    }

    const [row] = await this.db
      .select()
      .from(schema.interlineAgreements)
      .where(
        and(
          eq(schema.interlineAgreements.inboundAirline, inboundAirline),
          eq(schema.interlineAgreements.outboundAirline, outboundAirline),
        ),
      );

    if (!row) {
      return {
        online: false,
        permitted: false,
        bagThroughChecked: false,
        agreementId: null,
      };
    }

    return {
      online: false,
      permitted: true,
      bagThroughChecked: row.bagThroughChecked,
      agreementId: row.id,
    };
  }
}
