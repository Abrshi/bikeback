import express from "express";
import { signUp, signIn, logout, refreshToken, getMe } from "../../controllers/auth/auth.controller.js";


const router = express.Router();

router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/logout", logout);
router.post("/refresh", refreshToken);
router.get("/me", getMe);

// Example protected route

export default router;