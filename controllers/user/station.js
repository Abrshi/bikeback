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

export const nearbyStations = async (req, res) => {
  const { lat, lng, radius } = req.query;

  // 🚫 Validate input
  if (!lat || !lng) {
    return res.status(400).json({ error: "Missing coordinates" });
  }

  try {
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const maxRadius = radius ? parseFloat(radius) : null; // optional (km)

    // 🧠 Fetch stations (only occupied docks with bikes)
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

    // 🔄 Process stations
    const processed = stations.map((station) => {
      const stationLat = Number(station.latitude);
      const stationLng = Number(station.longitude);

      // 📍 Distance calculation
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
        available_bikes: station.docks.length, // already filtered
      };
    });

    // 🎯 Optional radius filtering (e.g. ?radius=2)
    const filtered = maxRadius
      ? processed.filter((s) => s.distance <= maxRadius)
      : processed;

    // 🧠 Smart sorting
    const sorted = filtered.sort((a, b) => {
      // prioritize stations with more bikes
      if (b.available_bikes !== a.available_bikes) {
        return b.available_bikes - a.available_bikes;
      }
      // then nearest
      return a.distance - b.distance;
    });

    // 📦 Limit results
    return res.json(sorted.slice(0, 10));
  } catch (err) {
    console.error("Nearby Stations Error:", err);
    return res.status(500).json({ error: "Failed to fetch stations" });
  }
};