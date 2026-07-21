CREATE TABLE "mct_rules" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"arrival_airport" varchar(3) NOT NULL,
	"departure_airport" varchar(3) NOT NULL,
	"scope" "mct_scope" NOT NULL,
	"arrival_airline" varchar(2),
	"departure_airline" varchar(2),
	"arrival_terminal" varchar(10),
	"departure_terminal" varchar(10),
	"mct_minutes" integer NOT NULL,
	"max_connection_minutes" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mct_rules" ADD CONSTRAINT "mct_rules_arrival_airport_airports_airport_code_fk" FOREIGN KEY ("arrival_airport") REFERENCES "public"."airports"("airport_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mct_rules" ADD CONSTRAINT "mct_rules_departure_airport_airports_airport_code_fk" FOREIGN KEY ("departure_airport") REFERENCES "public"."airports"("airport_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mct_rules" ADD CONSTRAINT "mct_rules_arrival_airline_airlines_airline_code_fk" FOREIGN KEY ("arrival_airline") REFERENCES "public"."airlines"("airline_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mct_rules" ADD CONSTRAINT "mct_rules_departure_airline_airlines_airline_code_fk" FOREIGN KEY ("departure_airline") REFERENCES "public"."airlines"("airline_code") ON DELETE no action ON UPDATE no action;