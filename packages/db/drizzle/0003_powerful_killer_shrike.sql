CREATE TYPE "public"."listing_kind" AS ENUM('property', 'package');--> statement-breakpoint
CREATE TYPE "public"."season_name" AS ENUM('standard', 'peak', 'ramadan', 'hajj', 'promo');--> statement-breakpoint
CREATE TABLE "currency" (
	"code" char(3) PRIMARY KEY NOT NULL,
	"minor_unit" integer NOT NULL,
	"symbol" text NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fx_rate" (
	"id" text PRIMARY KEY NOT NULL,
	"base_currency" char(3) NOT NULL,
	"quote_currency" char(3) NOT NULL,
	"rate_ppm" bigint NOT NULL,
	"as_of" timestamp with time zone NOT NULL,
	CONSTRAINT "fx_rate_base_ne_quote" CHECK ("fx_rate"."base_currency" <> "fx_rate"."quote_currency")
);
--> statement-breakpoint
CREATE TABLE "listing" (
	"id" text PRIMARY KEY NOT NULL,
	"kind" "listing_kind" NOT NULL,
	"display_name" text NOT NULL,
	"destination" text NOT NULL,
	"country_code" char(2) NOT NULL,
	"hero_image_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property" (
	"property_code" text PRIMARY KEY NOT NULL,
	"listing_id" text NOT NULL,
	"star_rating" integer,
	"address" text,
	CONSTRAINT "property_listing_id_unique" UNIQUE("listing_id"),
	CONSTRAINT "property_star_rating_range" CHECK ("property"."star_rating" IS NULL OR ("property"."star_rating" BETWEEN 1 AND 5))
);
--> statement-breakpoint
CREATE TABLE "rate_rule" (
	"id" text PRIMARY KEY NOT NULL,
	"listing_id" text NOT NULL,
	"season_id" text NOT NULL,
	"room_type_id" text,
	"min_occupancy" integer NOT NULL,
	"max_occupancy" integer NOT NULL,
	"amount" integer NOT NULL,
	"currency" char(3) NOT NULL,
	CONSTRAINT "rate_rule_max_gte_min" CHECK ("rate_rule"."max_occupancy" >= "rate_rule"."min_occupancy"),
	CONSTRAINT "rate_rule_amount_non_negative" CHECK ("rate_rule"."amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "room_type" (
	"id" text PRIMARY KEY NOT NULL,
	"property_code" text NOT NULL,
	"name" text NOT NULL,
	"max_occupancy" integer NOT NULL,
	CONSTRAINT "room_type_max_occupancy_positive" CHECK ("room_type"."max_occupancy" > 0)
);
--> statement-breakpoint
CREATE TABLE "season" (
	"id" text PRIMARY KEY NOT NULL,
	"listing_id" text NOT NULL,
	"name" "season_name" NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	CONSTRAINT "season_end_after_start" CHECK ("season"."end_date" > "season"."start_date")
);
--> statement-breakpoint
CREATE TABLE "package" (
	"package_code" text PRIMARY KEY NOT NULL,
	"listing_id" text NOT NULL,
	"duration_nights" integer NOT NULL,
	"includes" text,
	CONSTRAINT "package_listing_id_unique" UNIQUE("listing_id"),
	CONSTRAINT "package_duration_positive" CHECK ("package"."duration_nights" > 0)
);
--> statement-breakpoint
ALTER TABLE "fx_rate" ADD CONSTRAINT "fx_rate_base_currency_currency_code_fk" FOREIGN KEY ("base_currency") REFERENCES "public"."currency"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fx_rate" ADD CONSTRAINT "fx_rate_quote_currency_currency_code_fk" FOREIGN KEY ("quote_currency") REFERENCES "public"."currency"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property" ADD CONSTRAINT "property_listing_id_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listing"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rate_rule" ADD CONSTRAINT "rate_rule_listing_id_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listing"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rate_rule" ADD CONSTRAINT "rate_rule_season_id_season_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."season"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rate_rule" ADD CONSTRAINT "rate_rule_room_type_id_room_type_id_fk" FOREIGN KEY ("room_type_id") REFERENCES "public"."room_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rate_rule" ADD CONSTRAINT "rate_rule_currency_currency_code_fk" FOREIGN KEY ("currency") REFERENCES "public"."currency"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_type" ADD CONSTRAINT "room_type_property_code_property_property_code_fk" FOREIGN KEY ("property_code") REFERENCES "public"."property"("property_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "season" ADD CONSTRAINT "season_listing_id_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listing"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package" ADD CONSTRAINT "package_listing_id_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listing"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "fx_rate_base_quote_unique" ON "fx_rate" USING btree ("base_currency","quote_currency");--> statement-breakpoint
CREATE INDEX "idx_listing_destination" ON "listing" USING btree ("destination");--> statement-breakpoint
CREATE INDEX "idx_listing_kind" ON "listing" USING btree ("kind");--> statement-breakpoint
CREATE INDEX "idx_listing_active_kind" ON "listing" USING btree ("is_active","kind");--> statement-breakpoint
CREATE INDEX "idx_rate_rule_listing_season" ON "rate_rule" USING btree ("listing_id","season_id");--> statement-breakpoint
CREATE UNIQUE INDEX "rate_rule_band_unique" ON "rate_rule" USING btree ("listing_id","season_id","room_type_id","min_occupancy","max_occupancy");--> statement-breakpoint
CREATE UNIQUE INDEX "rate_rule_band_unique_no_room_type" ON "rate_rule" USING btree ("listing_id","season_id","min_occupancy","max_occupancy") WHERE "rate_rule"."room_type_id" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "room_type_property_name_unique" ON "room_type" USING btree ("property_code","name");--> statement-breakpoint
CREATE INDEX "idx_room_type_property" ON "room_type" USING btree ("property_code");--> statement-breakpoint
CREATE INDEX "idx_season_listing_start" ON "season" USING btree ("listing_id","start_date");