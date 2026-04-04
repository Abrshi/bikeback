import { prisma } from "../../lib/prisma.js";


export const createBike = async (req, res) => {
  const { battery_level, dock_id } = req.body;

  try {
    // 1. Check dock
    const dock = await prisma.dock.findUnique({
      where: { dock_id: Number(dock_id) },
    });

    if (!dock) {
      return res.status(404).json({ error: "Dock not found" });
    }

    if (dock.is_occupied) {
      return res.status(400).json({ error: "Dock already occupied" });
    }

    // 2. Create bike FIRST (IMPORTANT: use relation instead of dock_id)
    const bike = await prisma.bike.create({
      data: {
        battery_level: Number(battery_level),

        // ✅ OPTION 1 FIX (relation connect)
        dock: {
          connect: {
            dock_id: Number(dock_id), // or id depending on schema
          },
        },

        qr_code_identifier: "TEMP",
      },
    });

    // 3. Generate QR
    const random = Math.floor(1000 + Math.random() * 9000);
    const qr_code_identifier = `BIKE-${bike.bike_id}-${random}`;

    // 4. Update bike with QR
    const updatedBike = await prisma.bike.update({
      where: { bike_id: bike.bike_id },
      data: { qr_code_identifier },
    });

    // 5. Update dock
    await prisma.dock.update({
      where: { dock_id: Number(dock_id) },
      data: {
        is_occupied: true,
        bike: {
          connect: {
            bike_id: bike.bike_id,
          },
        },
        lock_status: "LOCKED",
      },
    });

    return res.status(201).json({
      message: "Bike created and dock locked",
      bike: updatedBike,
    });
  } catch (err) {
    console.error("Create Bike Error:", err);
    return res.status(500).json({ error: "Failed to create bike" });
  }
};

export const getBikes = async (req, res) => {
  try {
    const bikes = await prisma.bike.findMany({
      include: {
        dock: true,
      },
    });

    res.json(bikes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch bikes" });
  }
};

export const deleteBike = async (req, res) => {
  const { id } = req.params;

  try {
    const bike = await prisma.bike.findUnique({
      where: { bike_id: Number(id) },
    });

    if (!bike) {
      return res.status(404).json({ error: "Bike not found" });
    }

    // 1. Free dock
    if (bike.dock_id) {
      await prisma.dock.update({
        where: { dock_id: bike.dock_id },
        data: {
          is_occupied: false,
          bike_id: null,
          lock_status: "UNLOCKED",
        },
      });
    }

    // 2. Delete bike
    await prisma.bike.delete({
      where: { bike_id: Number(id) },
    });

    res.json({ message: "Bike deleted and dock unlocked" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
};