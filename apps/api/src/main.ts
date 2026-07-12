import { randomUUID } from 'node:crypto';
import type { IncomingMessage } from 'node:http';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { env } from './env';
import { setupSwagger } from './swagger';

async function bootstrap() {
  const adapter = new FastifyAdapter({
    // One request id shared by Fastify, pino logs, and the error envelope.
    // Honors an incoming x-request-id so IDs correlate across services.
    genReqId: (req: IncomingMessage) => {
      const incoming = req.headers['x-request-id'];
      return typeof incoming === 'string' && incoming.length > 0
        ? incoming
        : randomUUID();
    },
  });
  adapter.getInstance().addHook('onRequest', (req, reply, done) => {
    reply.header('x-request-id', req.id);
    done();
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
    // Buffer logs until the pino logger takes over, so even bootstrap
    // messages come out structured.
    { bufferLogs: true },
  );

  const logger = app.get(Logger);
  app.useLogger(logger);

  // /api prefix so REST routes line up with Better Auth's /api/auth basePath.
  app.setGlobalPrefix('api', { exclude: ['health'] });

  // CORS for the REST API (auth routes get their own CORS from
  // nestjs-better-auth based on trustedOrigins).
  app.enableCors({
    origin: [env.WEB_URL],
    credentials: true,
  });

  // Swagger UI at /docs, spec at /docs/openapi.json
  setupSwagger(app);

  app.enableShutdownHooks();

  await app.listen({ port: env.API_PORT, host: '0.0.0.0' });
  logger.log(
    `API ready: http://localhost:${env.API_PORT} (docs at /docs)`,
    'Bootstrap',
  );
}

void bootstrap();
