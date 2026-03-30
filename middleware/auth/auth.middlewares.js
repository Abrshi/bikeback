import jwt from "jsonwebtoken";
import { generateAccessToken } from "../../controllers/auth/auth.controller.js";
import { prisma } from "../../lib/prisma.js";

export const authMiddleware = async (req, res, next) => {
  const refreshTokenReceived =
    req.cookies?.refreshToken ||
    (req.headers?.refreshtoken?.startsWith("Bearer ")
      ? req.headers.refreshtoken.split(" ")[1]
      : null);

  const accessToken =
    req.cookies?.accessToken ||
    (req.headers?.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null);

  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      console.log("⚠️ Access token expired or invalid");
    }
  }

  if (!refreshTokenReceived) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const session = await prisma.session.findFirst({
      where: { refreshToken: refreshTokenReceived },
    });

    if (!session) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, role: true, fullName: true, email: true },
    });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const newAccessToken = generateAccessToken(user);

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      path: "/",
      maxAge:60 * 60 * 1000,
    });

    req.user = { id: user.id, role: user.role }; // attach to request
    // console.log("🔄 New access token issued from refresh token");

    next(); // continue to next middleware/route
  } catch (err) {
    console.log("⛔ Invalid refresh token:", err.message);
    return res.status(401).json({ error: "Invalid refresh token" });
  }
};