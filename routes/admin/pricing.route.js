import express from "express";
import { pricing, promocode } from "../../controllers/admin/pricing.js";


const router = express.Router();

router.post("/promocode", promocode);
router.post("/pricing", pricing);


// Example protected route

export default router;