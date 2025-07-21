import { integer, text, serial, timestamp, pgTable } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phoneNumber: text("phone_number").notNull(),
  eyeColor: text("eye_color").notNull(),
  hairColor: text("hair_color").notNull(),
  gender: text("gender").notNull(),
  height: integer("height").notNull(),
  weight: integer("weight").notNull(),
  bloodType: text("blood_type").notNull(),
  allergies: text("allergies").notNull(),
  medicalConditions: text("medical_conditions").notNull(),
  medications: text("medications").notNull(),
  tattoos: text("tattoos").notNull(),
});

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;

export const tripsTable = pgTable("trips", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  activity: text("activity").notNull(),
  time: text("time").notNull(),
  location: text("location").notNull(),
  emergencyContact: text("emergency_contact").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
});

export type InsertTrip = typeof tripsTable.$inferInsert;
export type SelectTrip = typeof tripsTable.$inferSelect;
