//geminisummary.service.js
import axios from "axios";

/* =====================================================
   SAFE JSON PARSER (HANDLES ```json ... ```)
===================================================== */
const extractJSON = (text) => {
  if (!text) throw new Error("Empty AI response");

  // Remove markdown code fences
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleaned);
};

/* =====================================================
   GEMINI INTERVIEW SUMMARY
===================================================== */
export const generateInterviewSummary = async (interview) => {
  try {
    const transcriptText = interview.transcript
      .map(
        (t) =>
          `${t.type === "ai" ? "Interviewer" : "Candidate"}: ${t.text}`
      )
      .join("\n");

    const prompt = `
You are an interview evaluator.

Analyze the following interview transcript and provide feedback.

Return ONLY valid JSON in this exact format:
{
  "strengths": ["..."],
  "weaknesses": ["..."],
  "improvements": ["..."],
  "topicsToWorkOn": ["..."],
  "overallFeedback": "..."
}

Transcript:
${transcriptText}
`;

    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent",
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: { "Content-Type": "application/json" },
        params: { key: process.env.GOOGLE_API_KEY },
      }
    );

    const aiText =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text;

    return extractJSON(aiText);
  } catch (err) {
    console.error("Gemini Summary Failed:", err.message);

    // ✅ FALLBACK SUMMARY (VERY IMPORTANT)
    return {
      strengths: ["Clear communication in parts of the interview"],
      weaknesses: ["Answers lacked depth in some areas"],
      improvements: ["Structure answers using STAR method"],
      topicsToWorkOn: [
        "Core concepts of the applied role",
        "Problem-solving explanation",
        "Confidence while answering",
      ],
      overallFeedback:
        "The interview shows potential, but more structured and detailed answers are required to perform well in real interviews.",
    };
  }
};
