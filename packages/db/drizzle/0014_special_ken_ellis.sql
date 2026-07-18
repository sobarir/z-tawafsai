CREATE TYPE "public"."travel_package_inclusion_kind" AS ENUM('included', 'excluded');--> statement-breakpoint
CREATE TYPE "public"."travel_package_meal_plan" AS ENUM('full_board', 'half_board', 'room_only');--> statement-breakpoint
CREATE TYPE "public"."travel_package_type" AS ENUM('umrah', 'umrah_plus', 'hajj');--> statement-breakpoint
CREATE TABLE "travel_package_departure" (
	"id" text PRIMARY KEY NOT NULL,
	"package_id" text NOT NULL,
	"departure_date" date NOT NULL,
	"return_date" date,
	"seats_note" text,
	CONSTRAINT "travel_package_departure_return_after_start" CHECK ("travel_package_departure"."return_date" IS NULL OR "travel_package_departure"."return_date" >= "travel_package_departure"."departure_date")
);
--> statement-breakpoint
CREATE TABLE "travel_package_inclusion" (
	"id" text PRIMARY KEY NOT NULL,
	"package_id" text NOT NULL,
	"kind" "travel_package_inclusion_kind" NOT NULL,
	"label" text NOT NULL,
	"sequence" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "travel_package_itinerary_day" (
	"id" text PRIMARY KEY NOT NULL,
	"package_id" text NOT NULL,
	"day_number" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	CONSTRAINT "travel_package_itinerary_day_number_positive" CHECK ("travel_package_itinerary_day"."day_number" > 0)
);
--> statement-breakpoint
CREATE TABLE "travel_package_stay" (
	"id" text PRIMARY KEY NOT NULL,
	"package_id" text NOT NULL,
	"property_code" text NOT NULL,
	"sequence" integer NOT NULL,
	"nights" integer NOT NULL,
	CONSTRAINT "travel_package_stay_nights_positive" CHECK ("travel_package_stay"."nights" > 0)
);
--> statement-breakpoint
ALTER TABLE "travel_package" ADD COLUMN "type" "travel_package_type" DEFAULT 'umrah' NOT NULL;--> statement-breakpoint
ALTER TABLE "travel_package" ADD COLUMN "meal_plan" "travel_package_meal_plan";--> statement-breakpoint
ALTER TABLE "travel_package_departure" ADD CONSTRAINT "travel_package_departure_package_id_travel_package_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."travel_package"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "travel_package_inclusion" ADD CONSTRAINT "travel_package_inclusion_package_id_travel_package_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."travel_package"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "travel_package_itinerary_day" ADD CONSTRAINT "travel_package_itinerary_day_package_id_travel_package_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."travel_package"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "travel_package_stay" ADD CONSTRAINT "travel_package_stay_package_id_travel_package_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."travel_package"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "travel_package_stay" ADD CONSTRAINT "travel_package_stay_property_code_property_property_code_fk" FOREIGN KEY ("property_code") REFERENCES "public"."property"("property_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_travel_package_departure_package" ON "travel_package_departure" USING btree ("package_id","departure_date");--> statement-breakpoint
CREATE INDEX "idx_travel_package_inclusion_package" ON "travel_package_inclusion" USING btree ("package_id");--> statement-breakpoint
CREATE UNIQUE INDEX "travel_package_itinerary_day_unique" ON "travel_package_itinerary_day" USING btree ("package_id","day_number");--> statement-breakpoint
CREATE UNIQUE INDEX "travel_package_stay_seq_unique" ON "travel_package_stay" USING btree ("package_id","sequence");--> statement-breakpoint
CREATE INDEX "idx_travel_package_stay_package" ON "travel_package_stay" USING btree ("package_id");