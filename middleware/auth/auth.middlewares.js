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

  // ✅ 1. Try access token
  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      console.log("⚠️ Access token expired, trying refresh...");
    }
  }

  // ❌ No refresh token
  if (!refreshTokenReceived) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // ✅ 2. Find session
    const session = await prisma.session.findFirst({
      where: { refreshToken: refreshTokenReceived },
    });

    if (!session) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    // ✅ 3. Get user
    const user = await prisma.user.findUnique({
      where: { user_id: session.user_id },
      select: {
        user_id: true,
        role: true,
        email: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // ✅ 4. Generate new access token
    const newAccessToken = generateAccessToken(user);

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      path: "/",
      maxAge: 60 * 60 * 1000,
    });

    req.user = {
      id: user.user_id,
      role: user.role,
    };

    next();
  } catch (err) {
    console.log("⛔ Refresh error:", err.message);
    return res.status(401).json({ error: "Invalid refresh token" });
  }
};