import { createPostSchema, postSchema } from '@repo/shared';
import { createZodDto } from 'nestjs-zod';

/**
 * DTOs derive from the shared Zod contracts (packages/shared):
 * - runtime validation via the global ZodValidationPipe
 * - OpenAPI schemas via @nestjs/swagger + nestjs-zod
 * - the same schemas type Orval's generated frontend hooks
 */
export class CreatePostDto extends createZodDto(createPostSchema) {}
export class PostDto extends createZodDto(postSchema) {}
