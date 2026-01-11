import express from "express";
import protect from "../middleware/auth.middleware.js";

import {
  startInterview,
  beginInterview,
  getFirstQuestion,
  askNextQuestion,
  submitAnswer,
  endInterview,
  getInterviewSummary,
  getMyInterviews,
} from "../controllers/interview.controller.js";

const router = express.Router();

/* ===== STATIC ===== */
router.get("/my-interviews", protect, getMyInterviews);

/* ===== CREATE ===== */
router.post("/start", protect, startInterview);

/* ===== FLOW ===== */
router.post("/:id/start", protect, beginInterview);
router.get("/:id/first-question", protect, getFirstQuestion);
router.post("/:id/answer", protect, submitAnswer);
router.get("/:id/next-question", protect, askNextQuestion);
router.post("/:id/end", protect, endInterview);
router.get("/:id/summary", protect, getInterviewSummary);

export default router;
