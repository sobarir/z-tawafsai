ALTER TABLE "listing" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "package" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "listing" CASCADE;--> statement-breakpoint
DROP TABLE "package" CASCADE;--> statement-breakpoint
ALTER TABLE "property" DROP CONSTRAINT "property_listing_id_unique";--> statement-breakpoint
DROP INDEX "idx_rate_rule_listing_season";--> statement-breakpoint
DROP INDEX "rate_rule_band_unique_no_room_type";--> statement-breakpoint
DROP INDEX "idx_season_listing_start";--> statement-breakpoint
DROP INDEX "rate_rule_band_unique";--> statement-breakpoint
ALTER TABLE "property" ALTER COLUMN "type" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "property" ALTER COLUMN "display_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "property" ALTER COLUMN "destination" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "property" ALTER COLUMN "country_code" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "property" ALTER COLUMN "is_active" SET DEFAULT true;--> statement-breakpoint
ALTER TABLE "property" ALTER COLUMN "is_active" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "property" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "property" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "rate_rule" ALTER COLUMN "property_code" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "rate_rule" ALTER COLUMN "room_type_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "season" ALTER COLUMN "property_code" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_property_destination" ON "property" USING btree ("destination");--> statement-breakpoint
CREATE INDEX "idx_property_type" ON "property" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_property_active_type" ON "property" USING btree ("is_active","type");--> statement-breakpoint
CREATE INDEX "idx_rate_rule_property_season" ON "rate_rule" USING btree ("property_code","season_id");--> statement-breakpoint
CREATE INDEX "idx_season_property_start" ON "season" USING btree ("property_code","start_date");--> statement-breakpoint
CREATE UNIQUE INDEX "rate_rule_band_unique" ON "rate_rule" USING btree ("property_code","season_id","room_type_id","min_occupancy","max_occupancy");--> statement-breakpoint
ALTER TABLE "property" DROP COLUMN "listing_id";--> statement-breakpoint
ALTER TABLE "rate_rule" DROP COLUMN "listing_id";--> statement-breakpoint
ALTER TABLE "season" DROP COLUMN "listing_id";--> statement-breakpoint
DROP TYPE "public"."listing_kind";
