import express from "express";
import cors from "cors";
import { db } from "./db";
import { usersTable } from "./schema";
import { eq } from "drizzle-orm";

const app = express();
app.use(cors());
app.use(express.json());

// POST /update-user
app.post("/update-user", async (req, res) => {
  const {
    userId,
    email,
    firstName,
    lastName,
    phoneNumber,
    eyeColor,
    hairColor,
    gender,
    height,
    weight,
    bloodType,
    allergies,
    medicalConditions,
    medications,
    tattoos,
  } = req.body;

  try {
    const existingUser = await db.select().from(usersTable).where(eq(usersTable.email, email));

    if (existingUser.length > 0) {
      await db
        .update(usersTable)
        .set({
          userId,
          email,
          firstName,
          lastName,
          phoneNumber,
          eyeColor,
          hairColor,
          gender,
          height: parseInt(height),
          weight: parseInt(weight),
          bloodType,
          allergies,
          medicalConditions,
          medications,
          tattoos,
        })
        .where(eq(usersTable.email, email));
    } else {
      await db.insert(usersTable).values({
        userId,
        email,
        firstName,
        lastName,
        phoneNumber,
        eyeColor,
        hairColor,
        gender,
        height: parseInt(height),
        weight: parseInt(weight),
        bloodType,
        allergies,
        medicalConditions,
        medications,
        tattoos,
      });
    }

    res.status(200).json({ message: "User data synced to Neon successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to sync user data." });
  }
});

// GET /get-user/:email
app.get("/get-user/:email", async (req, res) => {
  try {
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, req.params.email));

    if (!user.length) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json(user[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch user data." });
  }
});

app.listen(3001, () => console.log("Backend running on http://localhost:3001"));

