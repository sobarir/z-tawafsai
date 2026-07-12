CREATE TYPE "public"."flight_status" AS ENUM('ACTIVE', 'SUSPENDED', 'SEASONAL');--> statement-breakpoint
CREATE TYPE "public"."leg_role" AS ENUM('FULL', 'TECHNICAL_STOP');--> statement-breakpoint
CREATE TYPE "public"."mct_scope" AS ENUM('DD', 'DI', 'ID', 'II');--> statement-breakpoint
CREATE TABLE "airlines" (
	"airline_code" varchar(2) PRIMARY KEY NOT NULL,
	"icao_code" varchar(3),
	"name" varchar(100) NOT NULL,
	"country_code" varchar(2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "airports" (
	"airport_code" varchar(3) PRIMARY KEY NOT NULL,
	"icao_code" varchar(4),
	"name" varchar(100) NOT NULL,
	"city_code" varchar(3) NOT NULL,
	"country_code" varchar(2) NOT NULL,
	"timezone" varchar(50) NOT NULL,
	"latitude" numeric(9, 6),
	"longitude" numeric(9, 6),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flight_legs" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"flight_id" varchar(26) NOT NULL,
	"leg_sequence" integer NOT NULL,
	"role" "leg_role" NOT NULL,
	"dep_airport" varchar(3) NOT NULL,
	"arr_airport" varchar(3) NOT NULL,
	"departure_time" timestamp with time zone NOT NULL,
	"arrival_time" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "flight_legs_arrival_after_departure" CHECK ("flight_legs"."arrival_time" > "flight_legs"."departure_time")
);
--> statement-breakpoint
CREATE TABLE "flight_marketing" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"flight_id" varchar(26) NOT NULL,
	"marketing_airline" varchar(2) NOT NULL,
	"marketing_number" varchar(4) NOT NULL,
	"is_operating_carrier" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flights" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"operating_airline" varchar(2) NOT NULL,
	"flight_number" varchar(4) NOT NULL,
	"origin_airport" varchar(3) NOT NULL,
	"dest_airport" varchar(3) NOT NULL,
	"departure_time" timestamp with time zone NOT NULL,
	"arrival_time" timestamp with time zone NOT NULL,
	"aircraft_type" varchar(10),
	"status" "flight_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "flights_arrival_after_departure" CHECK ("flights"."arrival_time" > "flights"."departure_time")
);
--> statement-breakpoint
CREATE TABLE "interline_agreements" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"inbound_airline" varchar(2) NOT NULL,
	"outbound_airline" varchar(2) NOT NULL,
	"bag_through_checked" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "interline_agreements_inbound_ne_outbound" CHECK ("interline_agreements"."inbound_airline" <> "interline_agreements"."outbound_airline")
);
--> statement-breakpoint
CREATE TABLE "mct_rules" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"arrival_airport" varchar(3) NOT NULL,
	"departure_airport" varchar(3) NOT NULL,
	"scope" "mct_scope" NOT NULL,
	"arrival_airline" varchar(2),
	"departure_airline" varchar(2),
	"arrival_terminal" varchar(5),
	"departure_terminal" varchar(5),
	"mct_minutes" integer NOT NULL,
	"max_connection_minutes" integer DEFAULT 1440 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mct_rules_mct_minutes_positive" CHECK ("mct_rules"."mct_minutes" > 0),
	CONSTRAINT "mct_rules_max_gte_mct" CHECK ("mct_rules"."max_connection_minutes" >= "mct_rules"."mct_minutes")
);
--> statement-breakpoint
ALTER TABLE "flight_legs" ADD CONSTRAINT "flight_legs_flight_id_flights_id_fk" FOREIGN KEY ("flight_id") REFERENCES "public"."flights"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flight_legs" ADD CONSTRAINT "flight_legs_dep_airport_airports_airport_code_fk" FOREIGN KEY ("dep_airport") REFERENCES "public"."airports"("airport_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flight_legs" ADD CONSTRAINT "flight_legs_arr_airport_airports_airport_code_fk" FOREIGN KEY ("arr_airport") REFERENCES "public"."airports"("airport_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flight_marketing" ADD CONSTRAINT "flight_marketing_flight_id_flights_id_fk" FOREIGN KEY ("flight_id") REFERENCES "public"."flights"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flight_marketing" ADD CONSTRAINT "flight_marketing_marketing_airline_airlines_airline_code_fk" FOREIGN KEY ("marketing_airline") REFERENCES "public"."airlines"("airline_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flights" ADD CONSTRAINT "flights_operating_airline_airlines_airline_code_fk" FOREIGN KEY ("operating_airline") REFERENCES "public"."airlines"("airline_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flights" ADD CONSTRAINT "flights_origin_airport_airports_airport_code_fk" FOREIGN KEY ("origin_airport") REFERENCES "public"."airports"("airport_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flights" ADD CONSTRAINT "flights_dest_airport_airports_airport_code_fk" FOREIGN KEY ("dest_airport") REFERENCES "public"."airports"("airport_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interline_agreements" ADD CONSTRAINT "interline_agreements_inbound_airline_airlines_airline_code_fk" FOREIGN KEY ("inbound_airline") REFERENCES "public"."airlines"("airline_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interline_agreements" ADD CONSTRAINT "interline_agreements_outbound_airline_airlines_airline_code_fk" FOREIGN KEY ("outbound_airline") REFERENCES "public"."airlines"("airline_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mct_rules" ADD CONSTRAINT "mct_rules_arrival_airport_airports_airport_code_fk" FOREIGN KEY ("arrival_airport") REFERENCES "public"."airports"("airport_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mct_rules" ADD CONSTRAINT "mct_rules_departure_airport_airports_airport_code_fk" FOREIGN KEY ("departure_airport") REFERENCES "public"."airports"("airport_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mct_rules" ADD CONSTRAINT "mct_rules_arrival_airline_airlines_airline_code_fk" FOREIGN KEY ("arrival_airline") REFERENCES "public"."airlines"("airline_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mct_rules" ADD CONSTRAINT "mct_rules_departure_airline_airlines_airline_code_fk" FOREIGN KEY ("departure_airline") REFERENCES "public"."airlines"("airline_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_airports_city_code" ON "airports" USING btree ("city_code");--> statement-breakpoint
CREATE UNIQUE INDEX "flight_legs_flight_sequence_unique" ON "flight_legs" USING btree ("flight_id","leg_sequence");--> statement-breakpoint
CREATE UNIQUE INDEX "flight_marketing_unique" ON "flight_marketing" USING btree ("marketing_airline","marketing_number","flight_id");--> statement-breakpoint
CREATE UNIQUE INDEX "flight_marketing_one_operating_carrier" ON "flight_marketing" USING btree ("flight_id") WHERE "flight_marketing"."is_operating_carrier";--> statement-breakpoint
CREATE UNIQUE INDEX "flights_carrier_number_departure_unique" ON "flights" USING btree ("operating_airline","flight_number","departure_time");--> statement-breakpoint
CREATE INDEX "idx_flights_origin_dep" ON "flights" USING btree ("origin_airport","departure_time");--> statement-breakpoint
CREATE INDEX "idx_flights_dest_arr" ON "flights" USING btree ("dest_airport","arrival_time");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_interline_lookup" ON "interline_agreements" USING btree ("inbound_airline","outbound_airline");--> statement-breakpoint
CREATE INDEX "idx_mct_lookup" ON "mct_rules" USING btree ("arrival_airport","departure_airport","scope");