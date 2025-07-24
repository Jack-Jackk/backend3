import express from "express";
import { db } from "../db";
import { tripsTable, locationsTable, userStatsTable } from "../schema";
import { eq } from "drizzle-orm";

// Helper to calculate distance from array of locations (Haversine formula)
function calculateTripMiles(locations: { latitude: number; longitude: number }[]) {
  function toRad(x: number) { return x * Math.PI / 180; }
  let total = 0;
  for (let i = 1; i < locations.length; i++) {
    const a = locations[i - 1];
    const b = locations[i];
    const R = 6371; // km
    const dLat = toRad(b.latitude - a.latitude);
    const dLon = toRad(b.longitude - a.longitude);
    const lat1 = toRad(a.latitude);
    const lat2 = toRad(b.latitude);
    const d =
      2 *
      R *
      Math.asin(
        Math.sqrt(
          Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
        )
      );
    total += d;
  }
  return total * 0.621371; // convert km to miles
}

const router = express.Router();

// Add to trips.ts or a new stats route file
router.get("/stats", async (req, res) => {
  const { userId } = req.query;
  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "Missing or invalid userId." });
  }
  try {
    const stats = await db
      .select()
      .from(userStatsTable)
      .where(eq(userStatsTable.userId, userId));
    return res.status(200).json(stats[0] || {});
  } catch (error) {
    console.error("Error fetching stats:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

/* Saves a new trip to neonDB */
router.post("/create", async (req, res) => {
  const { userId, activity, time, location, emergencyContact, startedAt } = req.body;
  console.log("Received trip:", req.body);

  if (!userId || !activity || !time || !location || !emergencyContact || !startedAt) {
    return res.status(400).json({ error: "Missing required fields." });
  }
  try {
    let userTrips = await db
      .select()
      .from(tripsTable)
      .where(eq(tripsTable.userId, userId))
      .orderBy(tripsTable.startedAt);

    if (userTrips.length >= 5) {
      const oldestTrip = userTrips[0];
      await db.delete(locationsTable).where(eq(locationsTable.tripId, String(oldestTrip.id)));
      await db.delete(tripsTable).where(eq(tripsTable.id, oldestTrip.id));
    }

    const result = await db.insert(tripsTable).values({
      userId,
      activity,
      time,
      location,
      emergencyContact,
      startedAt: new Date(startedAt),
    }).returning();

    console.log("Trip created in DB");
    return res.status(200).json({ message: "Trip Created", tripID: result[0].id });
  } catch (error) {
    console.error("Error creating trip:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

/* Saves a location update to neonDB */
router.post("/location", async (req, res) => {
  console.log("Received location update:", req.body);
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

/* Ends a trip, updates stats */
router.post("/end", async (req, res) => {
  const { tripId, endedAt } = req.body;
  if (!tripId) {
    return res.status(400).json({ error: "Missing tripId." });
  }
  try {
    await db
    .update(tripsTable)
    .set({ endedAt: new Date(endedAt) })
    .where(eq(tripsTable.id, tripId));

    const trip = await db.select().from(tripsTable).where(eq(tripsTable.id, tripId));
    if (!trip[0]) return res.status(404).json({ error: "Trip not found." });
    const userId = trip[0].userId;
    const startAt = trip[0].startedAt;
    const endedAtDate = new Date(endedAt);

    const locations = await db
      .select()
      .from(locationsTable)
      .where(eq(locationsTable.tripId, String(tripId)));

    const miles = calculateTripMiles(locations);

    let duration = 0;
    if (endedAtDate && startAt) {
      duration = Math.floor((endedAtDate.getTime() - startAt.getTime()) / 1000);
      if (duration < 0) duration = 0;
    }

    const existingStats = await db
      .select()
      .from(userStatsTable)
      .where(eq(userStatsTable.userId, userId));
    if (existingStats.length > 0) {
      await db
        .update(userStatsTable)
        .set({
          totalTrips: existingStats[0].totalTrips + 1,
          totalDistance: existingStats[0].totalDistance + miles,
          totalTime: existingStats[0].totalTime + duration,
        })
        .where(eq(userStatsTable.userId, userId));
    } else {
      await db.insert(userStatsTable).values({
        userId,
        totalDistance: miles,
        totalTrips: 1,
        totalTime: duration,
      });
    }

    await db.delete(locationsTable).where(eq(locationsTable.tripId, String(tripId)));

    return res.status(200).json({ message: "Trip ended.", miles, duration });
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