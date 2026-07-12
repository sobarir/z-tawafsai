import { Global, Module } from '@nestjs/common';
import { createDb, type Database } from '@repo/db';
import { env } from '../env';

export const DATABASE = Symbol('DATABASE');

@Global()
@Module({
  providers: [
    {
      provide: DATABASE,
      useFactory: (): Database => createDb(env.DATABASE_URL),
    },
  ],
  exports: [DATABASE],
})
export class DatabaseModule {}
