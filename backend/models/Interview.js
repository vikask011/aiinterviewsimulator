// interview.js
import mongoose from "mongoose";

/* =========================
   TRANSCRIPT SUB-SCHEMA
========================= */
const transcriptSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["ai", "user"],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

/* =========================
   SUMMARY SUB-SCHEMA
========================= */
const summarySchema = new mongoose.Schema(
  {
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    improvements: {
      type: [String],
      default: [],
    },
    topicsToWorkOn: {
      type: [String],
      default: [],
    },
    overallFeedback: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

/* =========================
   INTERVIEW SCHEMA
========================= */
const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    company: { type: String, required: true },
    role: { type: String, required: true },
    experience: { type: String, required: true },
    interviewType: { type: String, required: true },

    techStack: {
      type: String,
      default: "",
    },

    duration: { type: String, required: true },

    status: {
      type: String,
      enum: [
        "created",
        "in-progress",
        "completing",
        "completed",
        "cancelled", // ✅ recommended
      ],
      default: "created",
    },

    /* =========================
       INTERVIEW FLOW CONTROL
    ========================= */
    currentQuestionIndex: {
      type: Number,
      default: 0,
    },

    transcript: {
      type: [transcriptSchema],
      default: [],
    },

    /* =========================
       INTERVIEW SUMMARY
    ========================= */
    summary: {
      type: summarySchema,
      default: null,
    },

    startedAt: Date,
    endedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Interview", interviewSchema);
