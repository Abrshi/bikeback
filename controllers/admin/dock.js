import { prisma } from "../../lib/prisma.js";

export const createDock = async (req, res) => {
  const { station_id, dock_number } = req.body;

  try {
    const dock = await prisma.dock.create({
      data: {
        station_id: Number(station_id),
        dock_number: Number(dock_number),
      },
    });

    res.status(201).json(dock);
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

    const docks = [];

    for (let i = 0; i < count; i++) {
      docks.push({
        station_id: Number(station_id),
        dock_number: start + i,
      });
    }

    await prisma.dock.createMany({
      data: docks,
    });

    res.json({ message: `${count} docks created` });
  } catch (err) {
    console.error("Bulk Create Error:", err);
    res.status(500).json({ error: "Bulk creation failed" });
  }
};


export const getDocksByStation = async (req, res) => {
  const { station_id } = req.params;

  try {
    const docks = await prisma.dock.findMany({
      where: { station_id: Number(station_id) },
      orderBy: { dock_number: "asc" },
    });

    res.json(docks);
  } catch (err) {
    console.error("Get Docks Error:", err);
    res.status(500).json({ error: "Failed to fetch docks" });
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