import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health‑check route
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

import authRouter, { authMiddleware } from "./auth.js";

// Auth routes
app.use("/", authRouter);

// Protected example route
app.get("/protected", authMiddleware, (_req, res) => {
  res.json({ secret: "You accessed a protected route!" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
