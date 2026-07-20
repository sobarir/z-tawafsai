ALTER TABLE "flight_legs" ADD COLUMN "departure_time_local" varchar(5) NOT NULL;--> statement-breakpoint
ALTER TABLE "flight_legs" ADD COLUMN "arrival_time_local" varchar(5) NOT NULL;--> statement-breakpoint
ALTER TABLE "flight_legs" ADD COLUMN "departure_day_offset" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "flight_legs" ADD COLUMN "arrival_day_offset" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "flights" ADD COLUMN "departure_time_local" varchar(5) NOT NULL;--> statement-breakpoint
ALTER TABLE "flights" ADD COLUMN "arrival_time_local" varchar(5) NOT NULL;--> statement-breakpoint
ALTER TABLE "flights" ADD COLUMN "arrival_day_offset" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_flights_origin_dep" ON "flights" USING btree ("origin_airport","departure_time_local");--> statement-breakpoint
CREATE INDEX "idx_flights_dest_arr" ON "flights" USING btree ("dest_airport","arrival_time_local");