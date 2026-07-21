CREATE TYPE "public"."journey_direction" AS ENUM('OUTBOUND', 'INBOUND');--> statement-breakpoint
CREATE TABLE "travel_package_departure_flight" (
	"id" text PRIMARY KEY NOT NULL,
	"departure_id" text NOT NULL,
	"flight_id" varchar(26) NOT NULL,
	"direction" "journey_direction" NOT NULL,
	"sequence" integer NOT NULL,
	CONSTRAINT "travel_package_departure_flight_seq_positive" CHECK ("travel_package_departure_flight"."sequence" > 0)
);
--> statement-breakpoint
ALTER TABLE "travel_package_departure" DROP CONSTRAINT "travel_package_departure_flight_id_flights_id_fk";
--> statement-breakpoint
ALTER TABLE "travel_package_departure_flight" ADD CONSTRAINT "travel_package_departure_flight_departure_id_travel_package_departure_id_fk" FOREIGN KEY ("departure_id") REFERENCES "public"."travel_package_departure"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "travel_package_departure_flight" ADD CONSTRAINT "travel_package_departure_flight_flight_id_flights_id_fk" FOREIGN KEY ("flight_id") REFERENCES "public"."flights"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_travel_package_departure_flight_dep" ON "travel_package_departure_flight" USING btree ("departure_id");--> statement-breakpoint
CREATE UNIQUE INDEX "travel_package_departure_flight_seq_unique" ON "travel_package_departure_flight" USING btree ("departure_id","direction","sequence");--> statement-breakpoint
ALTER TABLE "travel_package_departure" DROP COLUMN "flight_id";