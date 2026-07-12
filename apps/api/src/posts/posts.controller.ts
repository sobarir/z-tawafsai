import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { CreatePostDto, PostDto } from './posts.dto';
import { PostsService } from './posts.service';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  @Get()
  @ApiOperation({
    operationId: 'listPosts',
    summary: "List the authenticated user's posts",
  })
  @ApiOkResponse({ type: [PostDto] })
  list(@Session() session: UserSession): Promise<PostDto[]> {
    return this.posts.listByAuthor(session.user.id);
  }

  @Post()
  @ApiOperation({ operationId: 'createPost', summary: 'Create a post' })
  @ApiCreatedResponse({ type: PostDto })
  create(
    @Session() session: UserSession,
    // Validated by the global ZodValidationPipe against createPostSchema
    @Body() body: CreatePostDto,
  ): Promise<PostDto> {
    return this.posts.create(session.user.id, body);
  }
}
