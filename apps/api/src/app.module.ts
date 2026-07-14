import { Module } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { LoggerModule } from 'nestjs-pino';
import { ZodValidationPipe } from 'nestjs-zod';
import { AirlinesModule } from './airlines/airlines.module';
import { AirportsModule } from './airports/airports.module';
import { AppController } from './app.controller';
import { auth } from './auth/auth';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { loggerConfig } from './common/logger/logger.config';
import { ConnectionsModule } from './connections/connections.module';
import { DatabaseModule } from './database/database.module';
import { FlightMarketingModule } from './flight-marketing/flight-marketing.module';
import { FlightsModule } from './flights/flights.module';
import { HotelCurrenciesModule } from './hotel-currencies/hotel-currencies.module';
import { HotelFxRatesModule } from './hotel-fx-rates/hotel-fx-rates.module';
import { HotelPackagesModule } from './hotel-packages/hotel-packages.module';
import { HotelPropertiesModule } from './hotel-properties/hotel-properties.module';
import { HotelRateRulesModule } from './hotel-rate-rules/hotel-rate-rules.module';
import { HotelRoomTypesModule } from './hotel-room-types/hotel-room-types.module';
import { HotelSeasonsModule } from './hotel-seasons/hotel-seasons.module';
import { HotelsModule } from './hotels/hotels.module';
import { InterlineAgreementsModule } from './interline-agreements/interline-agreements.module';
import { MctRulesModule } from './mct-rules/mct-rules.module';
import { PostsModule } from './posts/posts.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // Structured logging (pino) with request ids + redaction
    LoggerModule.forRoot(loggerConfig),
    // Mounts Better Auth at /api/auth/* and registers a global AuthGuard.
    // Every route requires a session unless @AllowAnonymous/@OptionalAuth.
    // trustedOrigins CORS for auth routes is applied by this module.
    AuthModule.forRoot({ auth }),
    DatabaseModule,
    UsersModule,
    PostsModule,
    AirportsModule,
    AirlinesModule,
    FlightsModule,
    FlightMarketingModule,
    MctRulesModule,
    InterlineAgreementsModule,
    ConnectionsModule,
    HotelsModule,
    HotelCurrenciesModule,
    HotelFxRatesModule,
    HotelPropertiesModule,
    HotelPackagesModule,
    HotelRoomTypesModule,
    HotelSeasonsModule,
    HotelRateRulesModule,
  ],
  controllers: [AppController],
  providers: [
    // Validate every @Body/@Query/@Param against its Zod-derived DTO
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    // Consistent error envelope + 4xx/5xx logging
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
