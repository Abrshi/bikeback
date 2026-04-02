import { prisma } from "../../lib/prisma.js";

export const createStation = async (req, res) => {
  const {
    city,
    subcity,
    area_name,
    latitude,
    longitude,
    address_description,
    contact_phone,
  } = req.body;

  try {
    console.log("Received station data:", req.body); // Debug log
    // 1. Basic validation (important)
    if (!latitude || !longitude) {
      return res.status(400).json({
        error: "Latitude and longitude are required",
      });
    }

    // 2. Create station
    const station = await prisma.bikeStation.create({
      data: {
        city,
        subcity,
        area_name,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        address_description,
        contact_phone,
      },
    });

    // 3. Response
    res.status(201).json({
      message: "Bike station created successfully",
      station,
    });
  } catch (err) {
    console.error("Create Station Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};