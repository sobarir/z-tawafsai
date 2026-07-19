ALTER TABLE "travel_package_departure" DROP CONSTRAINT "travel_package_departure_return_after_start";--> statement-breakpoint
DROP INDEX "idx_travel_package_departure_package";--> statement-breakpoint
ALTER TABLE "travel_package_departure" ALTER COLUMN "departure_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "travel_package_departure" ALTER COLUMN "departure_date" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "travel_package_departure" ADD COLUMN "flight_id" varchar(26) NOT NULL;--> statement-breakpoint
ALTER TABLE "travel_package_departure" ADD COLUMN "available_seats" integer;--> statement-breakpoint
ALTER TABLE "travel_package_departure" ADD CONSTRAINT "travel_package_departure_flight_id_flights_id_fk" FOREIGN KEY ("flight_id") REFERENCES "public"."flights"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_travel_package_departure_package" ON "travel_package_departure" USING btree ("package_id");--> statement-breakpoint
ALTER TABLE "travel_package_departure" ADD CONSTRAINT "travel_package_departure_available_seats_nonneg" CHECK ("travel_package_departure"."available_seats" IS NULL OR "travel_package_departure"."available_seats" >= 0);