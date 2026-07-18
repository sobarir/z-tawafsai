CREATE TABLE "travel_provider" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"license_number" varchar(100),
	"contact_phone" text,
	"contact_email" text,
	"website" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "travel_package" ADD COLUMN "provider_id" text;--> statement-breakpoint
ALTER TABLE "travel_package" ADD COLUMN "fee_per_seat" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "travel_package" ADD CONSTRAINT "travel_package_provider_id_travel_provider_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."travel_provider"("id") ON DELETE set null ON UPDATE no action;