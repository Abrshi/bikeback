import express from "express";
import { bike, getBikeById, lockbike, unlockBike } from "../../controllers/user/bike.js";


const router = express.Router();

router.get("/bikes/:stationId", bike);
router.get("/bike/:id", getBikeById);
router.post("/unlock", unlockBike);
router.post("/lockbike", lockbike);
// Example protected route

export default router;