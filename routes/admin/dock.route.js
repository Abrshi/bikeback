import express from "express";
import { createDock, createMultipleDocks, deleteDock, getDocksByStation, updateDock } from "../../controllers/admin/dock.js";


const router = express.Router();

router.post("/docks", createDock);
router.post("/docks/bulk", createMultipleDocks);
router.get("/docks/:station_id", getDocksByStation);
router.put("/docks/:id", updateDock);
router.delete("/docks/:id", deleteDock);

// Example protected route

export default router;