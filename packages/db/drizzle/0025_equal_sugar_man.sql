ALTER TABLE "mct_rules" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "mct_rules" CASCADE;--> statement-breakpoint
ALTER TABLE "flight_legs" DROP CONSTRAINT "flight_legs_arrival_after_departure";--> statement-breakpoint
ALTER TABLE "flights" DROP CONSTRAINT "flights_arrival_after_departure";--> statement-breakpoint
DROP INDEX "flights_carrier_number_departure_unique";--> statement-breakpoint
DROP INDEX "idx_flights_origin_dep";--> statement-breakpoint
DROP INDEX "idx_flights_dest_arr";--> statement-breakpoint
ALTER TABLE "travel_package_departure" ADD COLUMN "departure_date" date NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "flights_carrier_number_unique" ON "flights" USING btree ("operating_airline","flight_number");--> statement-breakpoint
ALTER TABLE "flight_legs" DROP COLUMN "departure_time";--> statement-breakpoint
ALTER TABLE "flight_legs" DROP COLUMN "arrival_time";--> statement-breakpoint
ALTER TABLE "flights" DROP COLUMN "departure_time";--> statement-breakpoint
ALTER TABLE "flights" DROP COLUMN "arrival_time";--> statement-breakpoint
ALTER TABLE "travel_package_departure" ADD CONSTRAINT "travel_package_departure_return_after_departure" CHECK ("travel_package_departure"."return_date" IS NULL OR "travel_package_departure"."return_date" >= "travel_package_departure"."departure_date");