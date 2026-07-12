import type { INestApplication } from '@nestjs/common';
import type { OpenAPIObject } from '@nestjs/swagger';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';

export function buildOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('SaaS API')
    .setDescription(
      'NestJS + Fastify backend. Auth is served by Better Auth at /api/auth/* (not part of this spec).',
    )
    .setVersion('1.0.0')
    .addCookieAuth('better-auth.session_token')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // nestjs-zod: converts Zod-derived DTOs into clean OpenAPI schemas
  return cleanupOpenApiDoc(document);
}

export function setupSwagger(app: INestApplication): OpenAPIObject {
  const document = buildOpenApiDocument(app);
  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'docs/openapi.json',
  });
  return document;
}
