import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { MeResponseDto } from './users.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  /** Session is enforced by the global AuthGuard from nestjs-better-auth */
  @Get('me')
  @ApiOperation({ operationId: 'getMe', summary: 'The authenticated user' })
  @ApiOkResponse({ type: MeResponseDto })
  me(@Session() session: UserSession) {
    return { user: session.user };
  }
}
