import { db } from "./db";
import { usersTable } from "./schema";

async function seed() {
  try {
    await db.insert(usersTable).values([
      {
        userId: "user-123",
        email: "example1@email.com",
        firstName: "John",
        lastName: "Doe",
        phoneNumber: "555-1234",
        eyeColor: "Blue",
        hairColor: "Brown",
        gender: "Male",
        height: 180,
        weight: 75,
        bloodType: "O+",
        allergies: "Peanuts",
        medicalConditions: "Asthma",
        medications: "Inhaler",
        tattoos: "None",
      },
      {
        userId: "user-456",
        email: "example2@email.com",
        firstName: "Jane",
        lastName: "Smith",
        phoneNumber: "555-5678",
        eyeColor: "Green",
        hairColor: "Black",
        gender: "Female",
        height: 165,
        weight: 60,
        bloodType: "A-",
        allergies: "None",
        medicalConditions: "None",
        medications: "None",
        tattoos: "Butterfly on ankle",
      },
    ]);

    console.log("Seed complete.");
  } catch (error) {
    console.error("Failed to seed data:", error);
  }
}

seed();
