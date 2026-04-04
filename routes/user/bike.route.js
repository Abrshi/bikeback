import express from "express";
import { bike, getBikeById, unlockBike } from "../../controllers/user/bike.js";


const router = express.Router();

router.get("/bikes/:stationId", bike);
router.get("/bike/:id", getBikeById);
router.post("/unlock", unlockBike);
// Example protected route

export default router;