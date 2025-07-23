CREATE TABLE "locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"trip_id" text NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"timestamp" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trips" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"activity" text NOT NULL,
	"time" text NOT NULL,
	"location" text NOT NULL,
	"emergency_contact" text NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL
);
