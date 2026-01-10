//interview.controller.js
import Interview from "../models/Interview.js";
import { generateQuestion } from "../services/sarvam.service.js";
import { textToSpeech } from "../services/deepgram.service.js";
import { speechToText } from "../services/deepgram.service.js";
import { generateInterviewSummary } from "../services/sarvamSummary.service.js";


/* =====================================================
   CREATE INTERVIEW (FROM LANDING PAGE)
===================================================== */
export const startInterview = async (req, res) => {
  try {
    const {
      company,
      role,
      experience,
      interviewType,
      techStack,
      duration,
    } = req.body;

    if (!company || !role || !experience || !interviewType || !duration) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const interview = await Interview.create({
      userId: req.user.id,
      company,
      role,
      experience,
      interviewType,
      techStack: techStack || "",
      duration,
      status: "created",
    });

    res.status(201).json({
      interviewSessionId: interview._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   BEGIN INTERVIEW (AFTER CAMERA PERMISSION)
===================================================== */
export const beginInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (interview.status !== "created") {
      return res.status(400).json({ message: "Interview already started" });
    }

    interview.status = "in-progress";
    interview.startedAt = new Date();

    await interview.save();

    res.json({ message: "Interview started successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   SUBMIT USER ANSWER (SPEECH → TEXT)
===================================================== */
export const submitAnswer = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const transcriptText = await speechToText(req.body);

    interview.transcript.push({
      type: "user",
      text: transcriptText || "(No speech detected)",
    });

    await interview.save();

    res.json({
      answerText: transcriptText,
      readyForNext: true,
    });
  } catch (err) {
    console.error("Answer Error:", err.message);
    res.status(500).json({ message: "Failed to process answer" });
  }
};

/* =====================================================
   ASK NEXT AI QUESTION (ONE AT A TIME)
===================================================== */
export const askNextQuestion = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // 🔒 BACKEND SAFETY — prevent duplicate AI questions
    const lastEntry =
      interview.transcript[interview.transcript.length - 1];

    if (lastEntry && lastEntry.type === "ai") {
      return res.json({
        questionText: lastEntry.text,
        audio: null, // frontend must NOT replay audio
      });
    }

    const question = await generateQuestion(interview);

    interview.transcript.push({ type: "ai", text: question });
    interview.currentQuestionIndex += 1;

    await interview.save();

    const audioBuffer = await textToSpeech(question);

    res.json({
      questionText: question,
      audio: audioBuffer.toString("base64"),
    });
  } catch (err) {
    console.error("Question Error:", err.message);
    res.status(500).json({ message: "Failed to generate question" });
  }
};


// controllers/interview.controller.js

export const endInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // ✅ Return ONLY if summary already exists
    if (interview.status === "completed" && interview.summary) {
      return res.json({ summary: interview.summary });
    }

    // 🔒 Lock summary generation
    interview.status = "completing";
    await interview.save();

    let summary;

    // 🧠 Handle empty / early-ended interviews
    if (!interview.transcript || interview.transcript.length === 0) {
      summary = {
        strengths: [],
        weaknesses: ["Interview ended before sufficient answers"],
        improvements: ["Complete the interview fully for better feedback"],
        topicsToWorkOn: [],
        overallFeedback:
          "The interview was ended early, so a detailed evaluation could not be generated.",
      };
    } else {
      summary = await generateInterviewSummary(interview);
    }

    interview.summary = summary;
    interview.status = "completed";
    interview.endedAt = new Date();

    await interview.save();

    return res.json({ summary });
  } catch (err) {
    console.error("❌ End Interview Error:", err.message);
    res.status(500).json({ message: "Failed to end interview" });
  }
};

export const getInterviewSummary = async (req, res) => {
  const interview = await Interview.findById(req.params.id);
  if (!interview) {
    return res.status(404).json({ message: "Interview not found" });
  }

  if (!interview.summary) {
    return res.status(409).json({
      message: "Summary not generated yet",
    });
  }

  return res.json({ summary: interview.summary });
};

export const getMyInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({
      userId: req.user.id,
      status: "completed",
      summary: { $ne: null },
    })
      .sort({ createdAt: -1 })
      .select(
        "company role interviewType experience summary createdAt"
      );

    res.json({ interviews });
  } catch (err) {
    console.error("❌ Get My Interviews Error:", err.message);
    res.status(500).json({ message: "Failed to fetch interviews" });
  }
};