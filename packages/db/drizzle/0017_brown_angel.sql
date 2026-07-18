CREATE TYPE "public"."travel_package_booking_status" AS ENUM('confirmed', 'cancelled');--> statement-breakpoint
CREATE TABLE "travel_package_booking" (
	"id" text PRIMARY KEY NOT NULL,
	"departure_id" text NOT NULL,
	"customer_name" text NOT NULL,
	"pax" integer NOT NULL,
	"phone" text,
	"notes" text,
	"status" "travel_package_booking_status" DEFAULT 'confirmed' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "travel_package_booking_pax_positive" CHECK ("travel_package_booking"."pax" > 0)
);
--> statement-breakpoint
ALTER TABLE "travel_package" ADD COLUMN "flyer_url" text;--> statement-breakpoint
ALTER TABLE "travel_package_departure" ADD COLUMN "total_seats" integer;--> statement-breakpoint
ALTER TABLE "travel_package_booking" ADD CONSTRAINT "travel_package_booking_departure_id_travel_package_departure_id_fk" FOREIGN KEY ("departure_id") REFERENCES "public"."travel_package_departure"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_travel_package_booking_departure" ON "travel_package_booking" USING btree ("departure_id");--> statement-breakpoint
ALTER TABLE "travel_package_departure" ADD CONSTRAINT "travel_package_departure_total_seats_nonneg" CHECK ("travel_package_departure"."total_seats" IS NULL OR "travel_package_departure"."total_seats" >= 0);