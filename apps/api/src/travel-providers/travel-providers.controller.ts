import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { TravelProvider } from '@repo/shared';
import {
  CreateTravelProviderDto,
  TravelProviderDto,
  UpdateTravelProviderDto,
} from './travel-providers.dto';
import { TravelProvidersService } from './travel-providers.service';

// Umrah travel companies (operators) the agent partners with. Admin-only —
// every route requires a session (the global AuthGuard).
@ApiTags('travel-providers')
@Controller('travel-providers')
export class TravelProvidersController {
  constructor(private readonly providers: TravelProvidersService) {}

  @Get()
  @ApiOperation({
    operationId: 'listTravelProviders',
    summary: 'List travel providers',
  })
  @ApiOkResponse({ type: [TravelProviderDto] })
  list(): Promise<TravelProvider[]> {
    return this.providers.list();
  }

  @Get(':id')
  @ApiOperation({
    operationId: 'getTravelProvider',
    summary: 'Get a travel provider',
  })
  @ApiOkResponse({ type: TravelProviderDto })
  get(@Param('id') id: string): Promise<TravelProvider> {
    return this.providers.findById(id);
  }

  @Post()
  @ApiOperation({
    operationId: 'createTravelProvider',
    summary: 'Create a travel provider',
  })
  @ApiCreatedResponse({ type: TravelProviderDto })
  create(@Body() body: CreateTravelProviderDto): Promise<TravelProvider> {
    return this.providers.create(body);
  }

  @Patch(':id')
  @ApiOperation({
    operationId: 'updateTravelProvider',
    summary: 'Update a travel provider',
  })
  @ApiOkResponse({ type: TravelProviderDto })
  update(
    @Param('id') id: string,
    @Body() body: UpdateTravelProviderDto,
  ): Promise<TravelProvider> {
    return this.providers.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    operationId: 'deleteTravelProvider',
    summary: 'Delete a travel provider',
  })
  @ApiNoContentResponse()
  remove(@Param('id') id: string): Promise<void> {
    return this.providers.remove(id);
  }
}
