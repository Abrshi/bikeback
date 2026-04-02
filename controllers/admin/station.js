import { prisma } from "../../lib/prisma.js";

export const createStation = async (req, res) => {
  const { city, subcity, area_name, latitude, longitude, address_description, contact_phone,
  } = req.body;

  try {
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

export const getStations = async (req, res) => {
  try {
    const stations = await prisma.bikeStation.findMany({
      orderBy: { created_at: "desc" },
    });

    res.json(stations);
  } catch (err) {
    console.error("Get Stations Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteStation = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.bikeStation.delete({
      where: { station_id: Number(id) },
    });

    res.json({ message: "Station deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ error: "Delete failed" });
  }
};


export const updateStation = async (req, res) => {
  const { id } = req.params;

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
    const updated = await prisma.bikeStation.update({
      where: { station_id: Number(id) },
      data: {
        city,
        subcity,
        area_name,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        address_description,
        contact_phone,
      },
    });

    res.json({
      message: "Station updated",
      station: updated,
    });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ error: "Update failed" });
  }
};