import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { TravelPackageEarningsRow } from '@repo/shared';
import { TravelPackageEarningsRowDto } from './travel-packages.dto';
import { TravelPackagesService } from './travel-packages.service';

// The agent's commission report — earnings from confirmed bookings, grouped by
// provider + currency. Admin-only (the global AuthGuard gates it).
@ApiTags('travel-package-earnings')
@Controller('travel-package-earnings')
export class TravelPackageEarningsController {
  constructor(private readonly travelPackages: TravelPackagesService) {}

  @Get()
  @ApiOperation({
    operationId: 'listTravelPackageEarnings',
    summary: 'Agent commission earned per provider (from confirmed bookings)',
  })
  @ApiOkResponse({ type: [TravelPackageEarningsRowDto] })
  list(): Promise<TravelPackageEarningsRow[]> {
    return this.travelPackages.computeEarnings();
  }
}
