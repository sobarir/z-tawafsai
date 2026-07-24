import * as dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

import { createDb } from './src/client';
import { createId } from './src/id';
import { property } from './src/schema/app';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

const db = createDb(databaseUrl);

async function main() {
  const properties = await db.select().from(property);
  console.log(`Found ${properties.length} properties to migrate.`);

  let migrated = 0;
  for (const p of properties) {
    if (p.propertyCode.length === 26) {
      console.log(`Skipping ${p.propertyCode} (already a ULID)`);
      continue;
    }

    const newUlid = createId();
    await db.execute(
      `UPDATE property SET property_code = '${newUlid}' WHERE property_code = '${p.propertyCode}'`,
    );
    migrated++;
    console.log(`Migrated ${p.propertyCode} -> ${newUlid}`);
  }

  console.log(`Migration complete. Migrated ${migrated} properties.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
