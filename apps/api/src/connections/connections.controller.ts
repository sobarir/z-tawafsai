import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { ConnectionResult } from '@repo/shared';
import {
  ConnectionResultDto,
  ValidateConnectionChainDto,
  ValidateConnectionDto,
} from './connections.dto';
import { ConnectionsService } from './connections.service';

@ApiTags('connections')
@Controller('connections')
export class ConnectionsController {
  constructor(private readonly connections: ConnectionsService) {}

  @Post('validate')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'validateConnection',
    summary: 'Classify the connection between two consecutive flights',
  })
  @ApiOkResponse({ type: ConnectionResultDto })
  validate(
    // Validated by the global ZodValidationPipe against validateConnectionSchema
    @Body() body: ValidateConnectionDto,
  ): Promise<ConnectionResult> {
    return this.connections.classify(body.prevFlightId, body.nextFlightId);
  }

  @Post('validate-chain')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'validateConnectionChain',
    summary: 'Classify every consecutive connection in an itinerary',
  })
  @ApiOkResponse({ type: [ConnectionResultDto] })
  validateChain(
    // Validated by the global ZodValidationPipe against validateConnectionChainSchema
    @Body() body: ValidateConnectionChainDto,
  ): Promise<ConnectionResult[]> {
    return this.connections.validateChain(body.flightIds);
  }
}
