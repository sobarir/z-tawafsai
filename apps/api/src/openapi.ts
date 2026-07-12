/**
 * Emits openapi.json without starting the HTTP listener.
 * Used by Orval in apps/web to generate typed TanStack Query hooks:
 *   pnpm --filter api generate:api   (writes apps/api/openapi.json)
 *   pnpm --filter web generate:api   (runs Orval against it)
 */
import './openapi-env';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { buildOpenApiDocument } from './swagger';

async function generate() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { logger: false },
  );
  app.setGlobalPrefix('api', { exclude: ['health'] });

  const document = buildOpenApiDocument(app);
  const outPath = resolve(__dirname, '../openapi.json');
  writeFileSync(outPath, `${JSON.stringify(document, null, 2)}\n`);
  console.log(`[openapi] wrote ${outPath}`);
  await app.close();
}

void generate();
