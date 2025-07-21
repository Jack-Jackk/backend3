import express from "express";
import { db } from "../db";
import { tripsTable } from "../schema";
import { eq } from "drizzle-orm";

const router = express.Router();

/*Saves a new tip to neonDB*/
router.post("/create", async (req, res) => {
  const { userId, activity, time, location, emergencyContact, startedAt } = req.body;

  if (!userId || !activity || !time || !location || !emergencyContact || !startedAt) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    await db.insert(tripsTable).values({
      userId,
      activity,
      time,
      location,
      emergencyContact,
      startedAt: new Date(startedAt),
    });

    return res.status(200).json({ message: "Trip saved successfully." });
  } catch (error) {
    console.error("Error saving trip:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

/* This gets userID to ensure the use of the correct user when going on a trip*/
router.get("/history", async (req, res) => {
  const { userId } = req.query;

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "Missing or invalid userId." });
  }

  try {
    const trips = await db
      .select()
      .from(tripsTable)
      .where(eq(tripsTable.userId, userId));

    return res.status(200).json(trips);
  } catch (error) {
    console.error("Error fetching trips:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
