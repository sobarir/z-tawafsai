ALTER TABLE "season" ALTER COLUMN "name" SET DATA TYPE varchar(50) USING "name"::varchar(50);--> statement-breakpoint
DROP TYPE "public"."season_name";