import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Database } from '@repo/db';
import { schema } from '@repo/db';
import type {
  CreateMctRuleInput,
  MctRule,
  ResolveMctRuleQuery,
  UpdateMctRuleInput,
} from '@repo/shared';
import { and, asc, eq } from 'drizzle-orm';
import { DATABASE } from '../database/database.module';

type MctRuleRow = typeof schema.mctRules.$inferSelect;

const toMctRule = (row: MctRuleRow): MctRule => ({
  ...row,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

/** Number of non-NULL optional fields on a rule — its specificity rank. */
const specificity = (rule: MctRuleRow): number =>
  [
    rule.arrivalAirline,
    rule.departureAirline,
    rule.arrivalTerminal,
    rule.departureTerminal,
  ].filter((field) => field !== null).length;

/** A rule field matches the candidate iff it's NULL (wildcard) or equal. */
const fieldMatches = (
  ruleValue: string | null,
  candidateValue: string | undefined,
): boolean => ruleValue === null || ruleValue === (candidateValue ?? null);

/**
 * Picks the most-specific matching rule from a pre-filtered set (same
 * arrival_airport/departure_airport/scope), per /prd/13-mct-rules.md §A:
 * each non-NULL rule field must equal the candidate's value, ranked by count
 * of non-NULL fields (more specific wins), ties broken by newest updatedAt.
 */
export function pickMostSpecificMctRule(
  rules: MctRuleRow[],
  criteria: Pick<
    ResolveMctRuleQuery,
    | 'arrivalAirline'
    | 'departureAirline'
    | 'arrivalTerminal'
    | 'departureTerminal'
  >,
): MctRuleRow | null {
  const matches = rules.filter(
    (rule) =>
      fieldMatches(rule.arrivalAirline, criteria.arrivalAirline) &&
      fieldMatches(rule.departureAirline, criteria.departureAirline) &&
      fieldMatches(rule.arrivalTerminal, criteria.arrivalTerminal) &&
      fieldMatches(rule.departureTerminal, criteria.departureTerminal),
  );
  if (matches.length === 0) {
    return null;
  }
  matches.sort((a, b) => {
    const bySpecificity = specificity(b) - specificity(a);
    if (bySpecificity !== 0) {
      return bySpecificity;
    }
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });
  return matches[0];
}

@Injectable()
export class MctRulesService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async list(): Promise<MctRule[]> {
    const rows = await this.db
      .select()
      .from(schema.mctRules)
      .orderBy(asc(schema.mctRules.arrivalAirport));
    return rows.map(toMctRule);
  }

  async findById(id: string): Promise<MctRule> {
    const [row] = await this.db
      .select()
      .from(schema.mctRules)
      .where(eq(schema.mctRules.id, id));
    if (!row) {
      throw new NotFoundException(`MCT rule ${id} not found`);
    }
    return toMctRule(row);
  }

  async create(input: CreateMctRuleInput): Promise<MctRule> {
    const [created] = await this.db
      .insert(schema.mctRules)
      .values(input)
      .returning();
    return toMctRule(created);
  }

  async update(id: string, input: UpdateMctRuleInput): Promise<MctRule> {
    await this.findById(id);
    const [updated] = await this.db
      .update(schema.mctRules)
      .set(input)
      .where(eq(schema.mctRules.id, id))
      .returning();
    return toMctRule(updated);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.db.delete(schema.mctRules).where(eq(schema.mctRules.id, id));
  }

  /**
   * Non-throwing form for callers (the Step 8 classifier) that need to
   * branch on NO_MCT_RULE themselves rather than catch an exception.
   */
  async findApplicableRule(
    criteria: ResolveMctRuleQuery,
  ): Promise<MctRule | null> {
    const candidates = await this.db
      .select()
      .from(schema.mctRules)
      .where(
        and(
          eq(schema.mctRules.arrivalAirport, criteria.arrivalAirport),
          eq(schema.mctRules.departureAirport, criteria.departureAirport),
          eq(schema.mctRules.scope, criteria.scope),
        ),
      );
    const resolved = pickMostSpecificMctRule(candidates, criteria);
    return resolved ? toMctRule(resolved) : null;
  }

  /** operationId: resolveMctRule. Throws NotFoundException (NO_MCT_RULE) if no rule matches. */
  async resolve(criteria: ResolveMctRuleQuery): Promise<MctRule> {
    const rule = await this.findApplicableRule(criteria);
    if (!rule) {
      throw new NotFoundException(
        `NO_MCT_RULE: no rule for ${criteria.arrivalAirport}->${criteria.departureAirport} scope ${criteria.scope}`,
      );
    }
    return rule;
  }
}
