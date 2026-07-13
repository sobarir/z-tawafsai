ALTER TABLE "flights" ADD COLUMN "price" numeric(10, 2) DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "flights" ADD COLUMN "currency" varchar(3) DEFAULT 'USD' NOT NULL;--> statement-breakpoint
ALTER TABLE "flights" ADD CONSTRAINT "flights_price_non_negative" CHECK ("flights"."price" >= 0);