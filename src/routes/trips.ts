import express from "express";
import { db } from "../db";
import { tripsTable, locationsTable } from "../schema";
import { eq } from "drizzle-orm";

const router = express.Router();

/* Saves a new trip to neonDB */
router.post("/create", async (req, res) => {
  const { userId, activity, time, location, emergencyContact, startedAt } = req.body;
  if (!userId || !activity || !time || !location || !emergencyContact || !startedAt) {
    return res.status(400).json({ error: "Missing required fields." });
  }
  try {
    const result = await db.insert(tripsTable).values({
      userId,
      activity,
      time,
      location,
      emergencyContact,
      startedAt: new Date(startedAt), // <-- pass Date object
    }).returning();
    console.log("Location saved to DB.");
    return res.status(200).json({ message: "Trip created.", tripId: result[0].id });
  } catch (error) {
    console.error("Error creating trip:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

/* Saves a location update to neonDB */
router.post("/location", async (req, res) => {
  const { userId, tripId, latitude, longitude, timestamp } = req.body;
  if (!userId || !tripId || !latitude || !longitude || !timestamp) {
    return res.status(400).json({ error: "Missing required fields." });
  }
  try {
    await db.insert(locationsTable).values({
      userId,
      tripId,
      latitude,
      longitude,
      timestamp: new Date(timestamp), // <-- pass Date object
    });
    return res.status(200).json({ message: "Location saved." });
  } catch (error) {
    console.error("Error saving location:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.post("/end", async (req, res) => {
  const { tripId, endedAt } = req.body;
  if (!tripId) {
    return res.status(400).json({ error: "Missing tripId." });
  }
  try {
    await db
      .update(tripsTable)
      .set({ endedAt: new Date(endedAt) }) // <-- use client UTC time
      .where(eq(tripsTable.id, tripId));
    return res.status(200).json({ message: "Trip ended." });
  } catch (error) {
    console.error("Error ending trip:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

/* Gets trip history for a user */
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

    // For each trip, fetch its locations
    const tripsWithLocations = await Promise.all(
      trips.map(async (trip) => {
        const locations = await db
          .select()
          .from(locationsTable)
          .where(eq(locationsTable.tripId, String(trip.id)));
        return { ...trip, locations };
      })
    );

    return res.status(200).json(tripsWithLocations);
  } catch (error) {
    console.error("Error fetching trips:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

export default router;