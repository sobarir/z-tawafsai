import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { BadRequestException, Controller, Post, Req } from '@nestjs/common';
import {
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { createId } from '@repo/db';
import type { UploadResult } from '@repo/shared';
import type { FastifyRequest } from 'fastify';
import { env } from '../env';
import { UploadResultDto } from './uploads.dto';

// Allowed flyer types → file extension. A flyer is either a marketing image or
// a PDF; anything else is rejected.
const ALLOWED_TYPES = new Map<string, string>([
  ['image/png', '.png'],
  ['image/jpeg', '.jpg'],
  ['image/webp', '.webp'],
  ['application/pdf', '.pdf'],
]);

// Session-required (global AuthGuard) — only admins upload flyers. Files land in
// env.UPLOADS_DIR and are served back by @fastify/static at /uploads (see main.ts).
@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
  @Post('flyer')
  @ApiOperation({
    operationId: 'uploadFlyer',
    summary: 'Upload a package flyer (image or PDF)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({ type: UploadResultDto })
  async uploadFlyer(@Req() req: FastifyRequest): Promise<UploadResult> {
    const data = await req.file();
    if (!data) {
      throw new BadRequestException('No file provided');
    }
    const ext = ALLOWED_TYPES.get(data.mimetype);
    if (!ext) {
      throw new BadRequestException(
        'Unsupported file type — use PNG, JPEG, WebP, or PDF',
      );
    }

    const buffer = await data.toBuffer();
    // @fastify/multipart sets `truncated` when the file exceeds limits.fileSize.
    if (data.file.truncated) {
      throw new BadRequestException(
        `File exceeds the ${env.MAX_UPLOAD_BYTES}-byte limit`,
      );
    }

    await mkdir(env.UPLOADS_DIR, { recursive: true });
    const fileName = `${createId()}${ext}`;
    await writeFile(join(env.UPLOADS_DIR, fileName), buffer);

    return { url: `${env.API_PUBLIC_URL}/uploads/${fileName}` };
  }
}
