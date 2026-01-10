import axios from "axios";

const SARVAM_API_URL = "https://api.sarvam.ai/v1/chat/completions";

export const generateInterviewSummary = async (interview) => {
  try {
    const transcriptText = interview.transcript
      .map(
        (t) =>
          `${t.type === "ai" ? "Interviewer" : "Candidate"}: ${t.text}`
      )
      .join("\n");

    const systemPrompt = `
You are an interview evaluator.
Return ONLY valid JSON in this exact format:

{
  "strengths": ["..."],
  "weaknesses": ["..."],
  "improvements": ["..."],
  "topicsToWorkOn": ["..."],
  "overallFeedback": "..."
}
`;

    const userPrompt = `
Interview Transcript:
${transcriptText}
`;

    const response = await axios.post(
      SARVAM_API_URL,
      {
        model: "sarvam-m",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 500,
        stream: false,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-subscription-key": process.env.SARVAM_API_KEY,
        },
        timeout: 25000,
      }
    );

    const rawText =
      response.data?.choices?.[0]?.message?.content;

    if (!rawText) throw new Error("Empty Sarvam response");

    const clean = rawText.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (err) {
    console.error("⚠️ Sarvam Summary Failed:", err.response?.data || err.message);

    return {
      strengths: ["Answered conceptual interview questions"],
      weaknesses: ["Responses lacked depth in some areas"],
      improvements: ["Practice structured verbal explanations"],
      topicsToWorkOn: [
        interview.role,
        "System design basics",
        "API communication flow",
      ],
      overallFeedback:
        "The interview was completed successfully. Improving clarity and structure will enhance performance in real interviews.",
    };
  }
};
