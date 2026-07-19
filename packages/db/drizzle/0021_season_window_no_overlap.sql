-- Custom SQL migration file, put your code below! --
-- Non-overlap of season windows within a property. Drizzle's schema builder has
-- no API for Postgres EXCLUDE constraints, so this is hand-written per
-- prd/hotels/11-data-model.md. btree_gist was enabled by 0004. The old
-- `season_no_overlap` EXCLUDE on `season` was auto-dropped when
-- `season.property_code` was dropped in 0020.
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "season_window" ADD CONSTRAINT "season_window_no_overlap"
	EXCLUDE USING gist ("property_code" WITH =, daterange("start_date", "end_date") WITH &&);
