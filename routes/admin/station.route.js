import express from "express";
import { createStation } from "../../controllers/admin/station.js";


const router = express.Router();

router.post("/stations", createStation);


// Example protected route

export default router;