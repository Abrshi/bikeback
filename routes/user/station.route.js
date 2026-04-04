import express from "express";
import { nearbyStations } from "../../controllers/user/station.js";


const router = express.Router();

router.use("/nearbyStations/nearby", nearbyStations);
// Example protected route

export default router;