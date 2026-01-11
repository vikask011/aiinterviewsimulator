import Interview from "../models/Interview.js";
import { generateQuestion } from "../services/sarvam.service.js";
import { textToSpeech } from "../services/deepgram.service.js";
import { speechToText } from "../services/deepgram.service.js";
import { generateInterviewSummary } from "../services/sarvamSummary.service.js";


/* =====================================================
   CREATE INTERVIEW
===================================================== */
export const startInterview = async (req, res) => {
  try {
    // Changed duration to questionLimit
    const { company, role, experience, interviewType, techStack, questionLimit } = req.body;

    if (!company || !role || !experience || !interviewType || !questionLimit) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const interview = await Interview.create({
      userId: req.user.id,
      company,
      role,
      experience,
      interviewType,
      techStack: techStack || "",
      questionLimit: parseInt(questionLimit), // Store the limit (5, 10, 15, etc.)
      status: "created",
      transcript: [],
      currentQuestionIndex: 0,
    });

    res.status(201).json({ interviewSessionId: interview._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =====================================================
   BEGIN INTERVIEW
===================================================== */
export const beginInterview = async (req, res) => {
  const interview = await Interview.findById(req.params.id);
  if (!interview) return res.status(404).json({ message: "Interview not found" });

  if (interview.status !== "created") {
    return res.status(400).json({ message: "Interview already started" });
  }

  interview.status = "in-progress";
  interview.startedAt = new Date();
  await interview.save();

  res.json({ message: "Interview started" });
};

/* =====================================================
    FIRST QUESTION (UPDATED TO RETURN PROGRESS)
===================================================== */
export const getFirstQuestion = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    if (interview.transcript.length > 0) {
      return res.status(400).json({ message: "First question already asked" });
    }

    const question = await generateQuestion(interview);

    interview.transcript.push({ type: "ai", text: question });
    interview.currentQuestionIndex = 1;
    await interview.save();

    const audio = await textToSpeech(question);

    // ✅ ADDED: currentNumber and totalQuestions
    res.json({ 
      questionText: question, 
      audio: audio.toString("base64"),
      currentNumber: interview.currentQuestionIndex,
      totalQuestions: interview.questionLimit
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
/* =====================================================
   SUBMIT ANSWER
===================================================== */
export const submitAnswer = async (req, res) => {
  const interview = await Interview.findById(req.params.id);
  if (!interview) return res.status(404).json({ message: "Interview not found" });

  const text = await speechToText(req.body);

  interview.transcript.push({
    type: "user",
    text: text || "(No speech detected)",
  });

  await interview.save();

  res.json({ answerText: text, readyForNext: true });
};

/* =====================================================
   NEXT QUESTION (WITH LIMIT CHECK)
===================================================== */
export const askNextQuestion = async (req, res) => {
  const interview = await Interview.findById(req.params.id);
  if (!interview) return res.status(404).json({ message: "Interview not found" });

  // 1. Check if we have already reached the question limit
  if (interview.currentQuestionIndex >= interview.questionLimit) {
    return res.json({ 
      message: "Interview limit reached", 
      isFinished: true 
    });
  }

  const last = interview.transcript[interview.transcript.length - 1];
  if (!last || last.type !== "user") {
    return res.status(400).json({ message: "Answer the current question first" });
  }

  const question = await generateQuestion(interview);

  interview.transcript.push({ type: "ai", text: question });
  interview.currentQuestionIndex += 1;
  await interview.save();

  const audio = await textToSpeech(question);

  res.json({
    questionText: question,
    audio: audio.toString("base64"),
    currentNumber: interview.currentQuestionIndex,
    totalQuestions: interview.questionLimit
  });
};
/* =====================================================
   END INTERVIEW + SUMMARY
===================================================== */
export const endInterview = async (req, res) => {
  const interview = await Interview.findById(req.params.id);
  if (!interview) return res.status(404).json({ message: "Interview not found" });

  if (interview.status === "completed" && interview.summary) {
    return res.json({ summary: interview.summary });
  }

  interview.status = "completed";
  interview.endedAt = new Date();

  const summary =
    interview.transcript.length === 0
      ? {
          strengths: [],
          weaknesses: ["Interview ended too early"],
          improvements: ["Complete the interview"],
          topicsToWorkOn: [],
          overallFeedback: "Not enough data to evaluate",
        }
      : await generateInterviewSummary(interview);

  interview.summary = summary;
  await interview.save();

  res.json({ summary });
};

/* =====================================================
   GET SUMMARY
===================================================== */
export const getInterviewSummary = async (req, res) => {
  const interview = await Interview.findById(req.params.id);
  if (!interview) return res.status(404).json({ message: "Interview not found" });

  if (!interview.summary) {
    return res.status(409).json({ message: "Summary not ready" });
  }

  res.json({ summary: interview.summary });
};

/* =====================================================
   MY INTERVIEWS
===================================================== */
export const getMyInterviews = async (req, res) => {
  const interviews = await Interview.find({
    userId: req.user.id,
    status: "completed",
    summary: { $ne: null },
  }).sort({ createdAt: -1 });

  res.json({ interviews });
};
