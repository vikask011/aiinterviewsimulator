import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import interviewRoutes from "./routes/interview.routes.js";

dotenv.config();

// IMPORTANT: connect DB only once
let isConnected = false;
async function initDB() {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
}

const app = express();

/* ======================
   MIDDLEWARES
====================== */
app.use(cors());
app.use(express.json());

// Raw audio body parser (must be BEFORE routes)
app.use(
  "/api/interview/:id/answer",
  express.raw({ type: "audio/webm", limit: "10mb" })
);

/* ======================
   ROUTES
====================== */
app.use("/api/auth", authRoutes);
app.use("/api/interview", interviewRoutes);

/* ======================
   HEALTH CHECK
====================== */
app.get("/", (req, res) => {
  res.send("API is running on Vercel 🚀");
});

/* ======================
   EXPORT FOR VERCEL
====================== */
export default async function handler(req, res) {
  await initDB();
  return app(req, res);
}
