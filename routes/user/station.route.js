import express from "express";
import { getStats, nearbyStations } from "../../controllers/user/station.js";


const router = express.Router();

router.use("/nearbyStations/nearby", nearbyStations);
router.get("/stats", getStats);
// Example protected route

export default router;