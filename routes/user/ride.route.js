import express from "express";
import { allRides, currentRides } from "../../controllers/user/rides.js";


const router = express.Router();

router.get("/rides", allRides);
router.get("/ride", currentRides);
// Example protected route

export default router;