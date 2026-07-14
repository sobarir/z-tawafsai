-- Custom SQL migration file, put your code below! --
-- Non-overlap for `season` windows within a listing. Drizzle's schema builder has no
-- API for Postgres EXCLUDE constraints, so this is hand-written per prd/hotels/11-data-model.md.
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "season" ADD CONSTRAINT "season_no_overlap"
	EXCLUDE USING gist ("listing_id" WITH =, daterange("start_date", "end_date") WITH &&);
