import express from "express";
import { getAllUsers, getDashboardStats } from "../../controllers/admin/dashibored.js";


const router = express.Router();

router.get("/alluser", getAllUsers);
router.get("/data" ,getDashboardStats)

// Example protected route

export default router;