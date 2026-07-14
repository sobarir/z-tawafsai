CREATE TABLE "city" (
	"city_code" varchar(3) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"country_code" varchar(2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
