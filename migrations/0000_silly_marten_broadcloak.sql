CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"eye_color" text NOT NULL,
	"hair_color" text NOT NULL,
	"gender" text NOT NULL,
	"height" integer NOT NULL,
	"weight" integer NOT NULL,
	"blood_type" text NOT NULL,
	"allergies" text NOT NULL,
	"medical_conditions" text NOT NULL,
	"medications" text NOT NULL,
	"tattoos" text NOT NULL,
	CONSTRAINT "users_id_unique" UNIQUE("id")
);
