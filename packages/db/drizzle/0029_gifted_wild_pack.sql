ALTER TABLE "rate_rule" DROP CONSTRAINT "rate_rule_property_code_property_property_code_fk";
--> statement-breakpoint
ALTER TABLE "season_window" DROP CONSTRAINT "season_window_property_code_property_property_code_fk";
--> statement-breakpoint
ALTER TABLE "travel_package_stay" DROP CONSTRAINT "travel_package_stay_property_code_property_property_code_fk";
--> statement-breakpoint
ALTER TABLE "property" ALTER COLUMN "property_code" SET DATA TYPE varchar(26);--> statement-breakpoint
ALTER TABLE "rate_rule" ALTER COLUMN "property_code" SET DATA TYPE varchar(26);--> statement-breakpoint
ALTER TABLE "season_window" ALTER COLUMN "property_code" SET DATA TYPE varchar(26);--> statement-breakpoint
ALTER TABLE "travel_package_stay" ALTER COLUMN "property_code" SET DATA TYPE varchar(26);--> statement-breakpoint
ALTER TABLE "rate_rule" ADD CONSTRAINT "rate_rule_property_code_property_property_code_fk" FOREIGN KEY ("property_code") REFERENCES "public"."property"("property_code") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "season_window" ADD CONSTRAINT "season_window_property_code_property_property_code_fk" FOREIGN KEY ("property_code") REFERENCES "public"."property"("property_code") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "travel_package_stay" ADD CONSTRAINT "travel_package_stay_property_code_property_property_code_fk" FOREIGN KEY ("property_code") REFERENCES "public"."property"("property_code") ON DELETE no action ON UPDATE cascade;