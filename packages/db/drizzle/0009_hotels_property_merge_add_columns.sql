ALTER TABLE "property" ADD COLUMN "type" "property_type";--> statement-breakpoint
ALTER TABLE "property" ADD COLUMN "display_name" text;--> statement-breakpoint
ALTER TABLE "property" ADD COLUMN "destination" text;--> statement-breakpoint
ALTER TABLE "property" ADD COLUMN "country_code" char(2);--> statement-breakpoint
ALTER TABLE "property" ADD COLUMN "hero_image_url" text;--> statement-breakpoint
ALTER TABLE "property" ADD COLUMN "is_active" boolean;--> statement-breakpoint
ALTER TABLE "property" ADD COLUMN "created_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "rate_rule" ADD COLUMN "property_code" text;--> statement-breakpoint
ALTER TABLE "season" ADD COLUMN "property_code" text;--> statement-breakpoint
ALTER TABLE "rate_rule" ADD CONSTRAINT "rate_rule_property_code_property_property_code_fk" FOREIGN KEY ("property_code") REFERENCES "public"."property"("property_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "season" ADD CONSTRAINT "season_property_code_property_property_code_fk" FOREIGN KEY ("property_code") REFERENCES "public"."property"("property_code") ON DELETE no action ON UPDATE no action;