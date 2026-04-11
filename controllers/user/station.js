import { prisma } from "../../lib/prisma.js";

// 📍 Haversine formula (distance in KM)

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;

  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const Stations = async (req, res) => {
  console.log("Fetching nearby stations with query:", req.query);
  try {
    let { lat, lng, radius } = req.query;

    lat = parseFloat(lat);
    lng = parseFloat(lng);
    radius = 5000; // default 5km

    if (!lat || !lng) {
      return res.status(400).json({ error: "lat and lng required" });
    }

    // 🧠 Fetch stations + bikes count
    const stations = await prisma.bikeStation.findMany({
      include: {
        docks: {
          include: {
            bike: true,
          },
        },
      },
    });

    // 🧮 Compute distance + available bikes
    const processed = stations.map((station) => {
      const distance = getDistance(
        lat,
        lng,
        station.latitude,
        station.longitude
      );

      const available_bikes = station.docks.filter(
        (dock) => dock.bike && dock.bike.status === "AVAILABLE"
      ).length;

      return {
        id: station.station_id,
        latitude: station.latitude,
        longitude: station.longitude,
        area_name: station.area_name,
        available_bikes,
        distance,
      };
    });

    // 🎯 Filter by radius
    const filtered = processed.filter(
      (station) => station.distance <= radius
    );

    // 🥇 Sort nearest → farthest
    filtered.sort((a, b) => a.distance - b.distance);
   console.log("Nearby stations found:", filtered);
    return res.json(filtered);
  } catch (err) {
    console.error("Stations error:", err);
    res.status(500).json({ error: "Server error" });
  }
};



export const nearbyStations = async (req, res) => {
  const { lat, lng, radius } = req.query;

  // 🚫 Validate input
  if (!lat || !lng) {
    return res.status(400).json({ error: "Missing coordinates" });
  }

  try {
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const maxRadius = radius ? parseFloat(radius) : null;

    // 🧠 Fetch stations with occupied docks + bikes
    const stations = await prisma.bikeStation.findMany({
      include: {
        docks: {
          where: {
            is_occupied: true,
            bike_id: { not: null },
          },
          include: {
            bike: true,
          },
        },
      },
    });

    // 🔄 Process stations with distance calculation
    const processed = stations.map((station) => {
      const stationLat = Number(station.latitude);
      const stationLng = Number(station.longitude);

      const distance = getDistance(
        userLat,
        userLng,
        stationLat,
        stationLng
      );

      return {
        station_id: station.station_id,
        area_name: station.area_name,
        latitude: stationLat,
        longitude: stationLng,
        distance,
        available_bikes: station.docks.length,
      };
    });

    // 🎯 Optional radius filter
    const filtered = maxRadius
      ? processed.filter((s) => s.distance <= maxRadius)
      : processed;

    // 🧠 Sort: most bikes first, then nearest
    const sorted = filtered.sort((a, b) => {
      if (b.available_bikes !== a.available_bikes) {
        return b.available_bikes - a.available_bikes;
      }
      return a.distance - b.distance;
    });

    // 📦 RETURN ALL (no slice limit)
    return res.json(sorted);
  } catch (err) {
    console.error("Nearby Stations Error:", err);
    return res.status(500).json({ error: "Failed to fetch stations" });
  }
};



export const getStats = async (req, res) => {
  try {
    const totalBikes = await prisma.bike.count();

    const availableBikes = await prisma.bike.count({
      where: {
        status: "AVAILABLE",
      },
    });

    const totalStations = await prisma.bikeStation.count();
console.log("Stats fetched:", { totalBikes, availableBikes, totalStations });
    res.json({
      totalBikes,
      availableBikes,
      totalStations,
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ message: "Failed to get stats" });
  }
};