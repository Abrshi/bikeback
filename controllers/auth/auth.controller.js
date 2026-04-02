import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../../lib/prisma.js";
import { log } from "console";

// ---------------- Token Helpers ----------------
export const generateAccessToken = (user) =>
  jwt.sign(
    { user_id : user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" } // short-lived
  );

const generateRefreshToken = () =>
  crypto.randomBytes(64).toString("hex");

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

// ---------------- Cookie Options ----------------
const isProd = process.env.NODE_ENV === "production";

const accessCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  path: "/",
  maxAge: 15 * 60 * 1000, // 15 min
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// ---------------- SignUp ----------------
export const signUp = async (req, res) => {
  const { first_name, father_name, grandfather_name, email, password, phone_number } = req.body;

  try {
    // Check if phone number already exists
    const existing = await prisma.user.findUnique({ where: { phone_number } });
    if (existing) return res.status(409).json({ error: "Phone number already exists" });

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Get default role ("user")
    const defaultRole = await prisma.role.findUnique({ where: { role: "user" } });
    if (!defaultRole) return res.status(500).json({ error: "Default role not found" });

    // Create user with connected role
    const user = await prisma.user.create({
      data: {
        first_name,
        father_name,
        grandfather_name,
        email,
        phone_number,
        password_hash: passwordHash,
        role: { connect: { role_id: defaultRole.role_id } }, // ✅ Connect role
      },
      include: { role: true }, // include role info in response
    });

   

    // Send response
    res
      .status(201)
      .json({
        message: "User created",
        user: {
          id: user.user_id,
          first_name: user.first_name,
          father_name: user.father_name,
          grandfather_name: user.grandfather_name,
          email: user.email,
          phone_number: user.phone_number,
          role: user.role.role,
        },
      });
  } catch (err) {
    console.error("❌ SignUp error:", err);
    res.status(500).json({ error: "Server error" });
    console.log(err);
    
  }
};
// ---------------- SignIn ----------------
export const signIn = async (req, res) => {
  const { phone_number, password } = req.body;

  try {
   
    // 1. Find user
    const user = await prisma.user.findUnique({
      where: { phone_number },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 2. Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
   if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 3. Delete old sessions
    try {
      await prisma.session.deleteMany({
        where: { user_id: user.user_id }, // ✅ FIXED
      });
    } catch (err) {
      console.error("Error deleting old sessions:", err);
    }

    // 4. Generate tokens
    const refreshToken = generateRefreshToken();
    const hashedRefreshToken = hashToken(refreshToken);

    // 5. Create new session
    await prisma.session.create({
      data: {
        refreshToken: hashedRefreshToken,
        user: {
          connect: { user_id: user.user_id }, // ✅ FIXED
        },
      },
    });

    // 6. Generate access token
    const accessToken = generateAccessToken(user);
    // 7. get role info
    const role = await prisma.role.findUnique({
      where: { role_id: user.role_id },
    });
    // 8. Send response
    res
      .cookie("accessToken", accessToken, accessCookieOptions)
      .cookie("refreshToken", refreshToken, refreshCookieOptions)
      .json({
        message: "Logged in",
        user: {
          id: user.user_id,
          first_name: user.first_name,
          father_name: user.father_name,
          email: user.email,
          role: role.role,
        },
      });
  } catch (err) {
    console.error("SignIn Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
// ---------------- Get Current User ----------------
export const getMe = async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    if (!token)
      return res.status(401).json({ error: "No access token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.user_id  },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

// ---------------- Refresh Token ----------------
export const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token)
    return res.status(401).json({ error: "No refresh token" });

  try {
    const hashedToken = hashToken(token);

    const session = await prisma.session.findFirst({
      where: { refreshToken: hashedToken },
      include: { user: true },
    });

    if (!session)
      return res.status(403).json({ error: "Invalid refresh token" });

    // rotate refresh token
    const newRefreshToken = generateRefreshToken();
    const newHashedToken = hashToken(newRefreshToken);

    await prisma.session.update({
      where: { id: session.id },
      data: { refreshToken: newHashedToken },
    });

    const newAccessToken = generateAccessToken(session.user);

    res
      .cookie("accessToken", newAccessToken, accessCookieOptions)
      .cookie("refreshToken", newRefreshToken, refreshCookieOptions)
      .json({ message: "Token refreshed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// ---------------- Logout ----------------
export const logout = async (req, res) => {
  const token = req.cookies.refreshToken;

  try {
    if (token) {
      await prisma.session.deleteMany({
        where: { refreshToken: hashToken(token) },
      });
    }

    res
      .clearCookie("accessToken", accessCookieOptions)
      .clearCookie("refreshToken", refreshCookieOptions)
      .json({ message: "Logged out" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};