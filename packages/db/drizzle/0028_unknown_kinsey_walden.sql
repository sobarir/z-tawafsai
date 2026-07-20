ALTER TABLE "travel_package_stay" ADD COLUMN "city_code" varchar(3);--> statement-breakpoint
UPDATE "travel_package_stay" SET "city_code" = CASE WHEN substring("property_code", 1, 3) = 'MAD' THEN 'MED' ELSE substring("property_code", 1, 3) END;--> statement-breakpoint
ALTER TABLE "travel_package_stay" ALTER COLUMN "city_code" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "travel_package_stay" ADD CONSTRAINT "travel_package_stay_city_code_city_city_code_fk" FOREIGN KEY ("city_code") REFERENCES "public"."city"("city_code") ON DELETE no action ON UPDATE no action;