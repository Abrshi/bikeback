import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import axios from "axios";

import authRouter from "./routes/auth/auth.route.js";
// admin routes
import stationRouter from "./routes/admin/station.route.js";
import dockRouter from "./routes/admin/dock.route.js";
import bikeRouter from"./routes/admin/bike.route.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5500;

// ---------- Middleware ----------

app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000", "https://etbike.netlify.app" ,"https://vnfvpmgm-3000.uks1.devtunnels.ms"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// JSON parser
app.use(express.json());

// ---------- Routes ----------

app.get("/", (req, res) => {
  res.send({ message: "Bike API is running..." });
});

app.use("/api/v1/auth", authRouter);
// admin routes
app.use("/api/v1/admin", stationRouter);
app.use("/api/v1/admin", dockRouter);
app.use("/api/v1/admin",bikeRouter)
// Google Drive image proxy
app.get("/api/v1/google-image/:id", async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).send("Missing file id");

  try {
    const url = `https://drive.google.com/uc?id=${id}`;
    const response = await axios.get(url, { responseType: "stream" });
    res.setHeader("Content-Type", "image/jpeg");
    response.data.pipe(res);
  } catch (err) {
    console.error("Error fetching image:", err.message);
    res.status(500).send("Failed to fetch image");
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    console.error("⚠️ JSON parse error:", err.message);
    return res.status(400).json({ message: "Invalid JSON body" });
  }
  console.error("💥 Server Error:", err.stack || err.message);
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

export default app;