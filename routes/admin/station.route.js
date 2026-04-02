import express from "express";
import { createStation, deleteStation, getStations, updateStation } from "../../controllers/admin/station.js";


const router = express.Router();

router.post("/stations", createStation);
router.get("/stations", getStations);
router.put("/stations/:id", updateStation);
router.delete("/stations/:id", deleteStation);


// Example protected route

export default router;