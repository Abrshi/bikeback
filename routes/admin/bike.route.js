import express from "express";
import { createBike, deleteBike, getBikes } from "../../controllers/admin/bike.js";


const router = express.Router();

router.post("/bikes", createBike);
router.get("/bikes", getBikes);
router.delete("/bikes/:id", deleteBike);

// Example protected route

export default router;