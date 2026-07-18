-- Custom SQL migration file, put your code below! --
-- The season_no_overlap EXCLUDE constraint (0004_hotels_season_no_overlap.sql)
-- was defined on listing_id, which was dropped in
-- 0011_hotels_property_merge_finalize.sql (Postgres auto-drops constraints
-- referencing a dropped column). Re-create it on property_code, the
-- replacement natural key for the same non-overlap invariant.
ALTER TABLE "season" ADD CONSTRAINT "season_no_overlap"
	EXCLUDE USING gist ("property_code" WITH =, daterange("start_date", "end_date") WITH &&);
