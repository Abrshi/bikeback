import { prisma } from "../../lib/prisma.js";

export const createDock = async (req, res) => {
  const { station_id, dock_number } = req.body;

  try {
    // 🧱 Step 1: Create dock first
    const dock = await prisma.dock.create({
      data: {
        station_id: Number(station_id),
        dock_number: Number(dock_number),
      },
    });

    // 🎲 Step 2: Generate random 4-digit number
    const randomNum = Math.floor(1000 + Math.random() * 9000);

    // 🏷️ Step 3: Create QR code string
    const qrCode = `dock-${dock.dock_id}-${randomNum}`;

    // 💾 Step 4: Update dock with QR
    const updatedDock = await prisma.dock.update({
      where: { dock_id: dock.dock_id },
      data: {
        qr_code_identifier: qrCode,
      },
    });

    res.status(201).json(updatedDock);
  } catch (err) {
    console.error("Create Dock Error:", err);
    res.status(500).json({ error: "Failed to create dock" });
  }
};

export const createMultipleDocks = async (req, res) => {
  const { station_id, count } = req.body;

  try {
    const existing = await prisma.dock.findMany({
      where: { station_id: Number(station_id) },
      orderBy: { dock_number: "desc" },
      take: 1,
    });

    let start = existing.length > 0 ? existing[0].dock_number + 1 : 1;

    const createdDocks = [];

    for (let i = 0; i < count; i++) {
      // 🧱 Step 1: Create dock
      const dock = await prisma.dock.create({
        data: {
          station_id: Number(station_id),
          dock_number: start + i,
        },
      });

      // 🎲 Step 2: Generate QR
      let qrCode;
      let isUnique = false;

      while (!isUnique) {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        qrCode = `dock-${dock.dock_id}-${randomNum}`;

        try {
          await prisma.dock.update({
            where: { dock_id: dock.dock_id },
            data: { qr_code_identifier: qrCode },
          });
          isUnique = true;
        } catch (err) {
          if (err.code !== "P2002") throw err; // retry if duplicate
        }
      }
      console.log(`Created dock ${dock.dock_id} with QR: ${qrCode}`);

      createdDocks.push({
        ...dock,
        qr_code_identifier: qrCode,
      });
    }

    res.json({
      message: `${count} docks created with QR codes`,
      docks: createdDocks,
    });
  } catch (err) {
    console.error("Bulk Create Error:", err);
    res.status(500).json({ error: "Bulk creation failed" });
  }
};


export const getDocksByStation = async (req, res) => {
  const { station_id } = req.params;

  // ❗ Validate input
  if (!station_id || isNaN(Number(station_id))) {
    return res.status(400).json({
      error: "Invalid station_id",
    });
  }

  try {
    const docks = await prisma.dock.findMany({
      where: { station_id: Number(station_id) },
      orderBy: { dock_number: "asc" },

      // ⚡ optional: only fetch what you need
      select: {
        dock_id: true,
        dock_number: true,
        is_occupied: true,
        lock_status: true,
        qr_code_identifier: true,
      },
    });

    const result = docks.map((dock) => ({
      ...dock,
      qr_image: `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
        dock.qr_code_identifier
      )}&size=100x100`,
    }));

    res.json(result);
  } catch (err) {
    console.error("Get Docks Error:", err);

    res.status(500).json({
      error: "Failed to fetch docks",
    });
  }
};


export const updateDock = async (req, res) => {
  const { id } = req.params;
  const { lock_status, is_occupied } = req.body;

  try {
    const updated = await prisma.dock.update({
      where: { dock_id: Number(id) },
      data: {
        lock_status,
        is_occupied,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("Update Dock Error:", err);
    res.status(500).json({ error: "Update failed" });
  }
};


export const deleteDock = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.dock.delete({
      where: { dock_id: Number(id) },
    });

    res.json({ message: "Dock deleted" });
  } catch (err) {
    console.error("Delete Dock Error:", err);
    res.status(500).json({ error: "Delete failed" });
  }
};