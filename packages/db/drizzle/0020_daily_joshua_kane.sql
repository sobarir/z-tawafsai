CREATE TABLE "season_window" (
	"id" text PRIMARY KEY NOT NULL,
	"property_code" text NOT NULL,
	"season_id" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	CONSTRAINT "season_window_end_after_start" CHECK ("season_window"."end_date" > "season_window"."start_date")
);
--> statement-breakpoint
ALTER TABLE "season" DROP CONSTRAINT "season_end_after_start";--> statement-breakpoint
ALTER TABLE "room_type" DROP CONSTRAINT "room_type_property_code_property_property_code_fk";
--> statement-breakpoint
ALTER TABLE "season" DROP CONSTRAINT "season_property_code_property_property_code_fk";
--> statement-breakpoint
DROP INDEX "room_type_property_name_unique";--> statement-breakpoint
DROP INDEX "idx_room_type_property";--> statement-breakpoint
DROP INDEX "idx_season_property_start";--> statement-breakpoint
ALTER TABLE "season_window" ADD CONSTRAINT "season_window_property_code_property_property_code_fk" FOREIGN KEY ("property_code") REFERENCES "public"."property"("property_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "season_window" ADD CONSTRAINT "season_window_season_id_season_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."season"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_season_window_property_start" ON "season_window" USING btree ("property_code","start_date");--> statement-breakpoint
CREATE UNIQUE INDEX "room_type_name_unique" ON "room_type" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "season_name_unique" ON "season" USING btree ("name");--> statement-breakpoint
ALTER TABLE "room_type" DROP COLUMN "property_code";--> statement-breakpoint
ALTER TABLE "season" DROP COLUMN "property_code";--> statement-breakpoint
ALTER TABLE "season" DROP COLUMN "start_date";--> statement-breakpoint
ALTER TABLE "season" DROP COLUMN "end_date";