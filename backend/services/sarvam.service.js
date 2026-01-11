import axios from "axios";

const SARVAM_API_URL = "https://api.sarvam.ai/v1/chat/completions";

export const generateQuestion = async (interview) => {
  const { 
    company, role, experience, interviewType, 
    techStack, transcript, currentQuestionIndex, questionLimit 
  } = interview;

  try {
    // Clean history: Ensure we don't send empty or undefined strings
    const history = transcript && transcript.length > 0
      ? transcript
          .map((msg) => `${msg.type === "ai" ? "Interviewer" : "Candidate"}: ${msg.text}`)
          .join("\n")
      : "No questions asked yet.";

    const systemPrompt = `You are a professional AI interviewer. Currently at question ${currentQuestionIndex + 1} of ${questionLimit}. CRITICAL: Never repeat a question from the history. Return ONLY the question text.`;

    const userPrompt = `Role: ${role}. Company: ${company}. History: ${history}. Generate the next unique question:`;

    const response = await axios.post(
      SARVAM_API_URL,
      {
        // ⚠️ Check your documentation: If 'sarvam-2k' fails, use 'sarvam-1'
        model: "sarvam-m", 
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-subscription-key": process.env.SARVAM_API_KEY,
        },
      }
    );

    return response.data?.choices?.[0]?.message?.content?.trim();
  } catch (err) {
    // Log the actual error body from Sarvam to see exactly what is 'Bad'
    console.error("❌ Sarvam API Details:", err.response?.data || err.message);
    return `Can you explain a technical challenge you faced while working with ${techStack || role}?`;
  }
};