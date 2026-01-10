import express from "express";
import protect from "../middleware/auth.middleware.js";

import {
  startInterview,
  beginInterview,
  askNextQuestion,
  submitAnswer,
  endInterview,
  getInterviewSummary,
  getMyInterviews,
} from "../controllers/interview.controller.js";

const router = express.Router();

/* =========================
   STATIC ROUTES (FIRST)
========================= */
router.get("/my-interviews", protect, getMyInterviews);

/* =========================
   INTERVIEW CREATION
========================= */
router.post("/start", protect, startInterview);

/* =========================
   DYNAMIC ROUTES (LAST)
========================= */
router.post("/:id/start", protect, beginInterview);
router.get("/:id/next-question", protect, askNextQuestion);
router.post("/:id/answer", protect, submitAnswer);
router.post("/:id/end", protect, endInterview);
router.get("/:id/summary", protect, getInterviewSummary);

export default router;
