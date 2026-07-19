DROP INDEX "rate_rule_band_unique";--> statement-breakpoint
ALTER TABLE "rate_rule" ALTER COLUMN "season_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "rate_rule" ADD CONSTRAINT "rate_rule_band_unique" UNIQUE NULLS NOT DISTINCT("property_code","season_id","room_type_id","min_occupancy","max_occupancy");