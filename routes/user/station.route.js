import express from "express";
import { getStats, nearbyStations, Stations } from "../../controllers/user/station.js";


const router = express.Router();

router.use("/nearbyStations/nearby", nearbyStations);
router.get("/map/nearby", Stations);
router.get("/stats", getStats);
// Example protected route

export default router;