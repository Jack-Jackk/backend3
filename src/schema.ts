import { integer, text, serial, pgTable } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
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



