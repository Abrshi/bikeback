import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma.js";

export const adminMiddleware = async (req, res, next) => {
  const accessToken =
    req.cookies?.accessToken ||
    (req.headers?.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null);

  if (!accessToken) {
    return res.status(401).json({ error: "No token" });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { user_id: decoded.user_id },
      select: { role: true },
    });
    console.log("Admin Middleware - User role:", user ? user.role : "User not found");

if (!user || user.role.role !== 'admin'){
            console.log("Unauthorized access attempt - User role:", user ? user.role : "User not found");
      return res.status(403).json({ error: "Admins only" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};