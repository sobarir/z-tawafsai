-- Custom SQL migration file, put your code below! --
-- Backfill `property` with its 1:1 `listing` row's fields, and backfill
-- `season`/`rate_rule.property_code` from their `listing_id` via `property`.
-- Every pre-existing listing is `kind='property'` in this dataset (the
-- `package` concept is being removed in the next migration), and every
-- pre-existing property predates the new `type` classification, so it
-- backfills to 'hotel' -- the actual seeded properties (JED-WFH, MAD-CIN)
-- are hotels.
UPDATE "property" p
SET
  "type" = 'hotel',
  "display_name" = l."display_name",
  "destination" = l."destination",
  "country_code" = l."country_code",
  "hero_image_url" = l."hero_image_url",
  "is_active" = l."is_active",
  "created_at" = l."created_at"
FROM "listing" l
WHERE p."listing_id" = l."id";

UPDATE "season" s
SET "property_code" = p."property_code"
FROM "property" p
WHERE s."listing_id" = p."listing_id";

UPDATE "rate_rule" r
SET "property_code" = p."property_code"
FROM "property" p
WHERE r."listing_id" = p."listing_id";

-- Any season/rate_rule row that only ever belonged to a `package` listing
-- (no matching `property`) has no property to backfill onto and is removed
-- here -- the package concept has no replacement in the merged schema.
DELETE FROM "rate_rule" WHERE "property_code" IS NULL;
DELETE FROM "season" WHERE "property_code" IS NULL;
