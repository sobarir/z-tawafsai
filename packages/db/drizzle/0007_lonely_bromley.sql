CREATE TABLE "travel_package" (
	"id" text PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"flight_id" varchar(26) NOT NULL,
	"property_code" text NOT NULL,
	"duration_nights" integer NOT NULL,
	"hero_image_url" text,
	"price" numeric(10, 2) DEFAULT 0 NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "travel_package" ADD CONSTRAINT "travel_package_flight_id_flights_id_fk" FOREIGN KEY ("flight_id") REFERENCES "public"."flights"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "travel_package" ADD CONSTRAINT "travel_package_property_code_property_property_code_fk" FOREIGN KEY ("property_code") REFERENCES "public"."property"("property_code") ON DELETE no action ON UPDATE no action;