ALTER TABLE "travel_package" DROP CONSTRAINT "travel_package_flight_id_flights_id_fk";
--> statement-breakpoint
ALTER TABLE "travel_package" DROP COLUMN "flight_id";--> statement-breakpoint
ALTER TABLE "travel_package_departure" DROP COLUMN "departure_date";