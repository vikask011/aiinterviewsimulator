import axios from "axios";

const SARVAM_API_URL = "https://api.sarvam.ai/v1/chat/completions";

export const generateQuestion = async ({
  company,
  role,
  experience,
  interviewType,
  techStack,
}) => {
  try {
    const systemPrompt = `
You are an AI interviewer conducting a LIVE SPOKEN interview.

Rules:
- Do NOT ask coding questions
- Do NOT ask the candidate to write code
- Ask ONLY conceptual, verbal questions
- Ask ONLY ONE question
- Return ONLY the question text
`;

    const userPrompt = `
Company: ${company}
Role: ${role}
Experience: ${experience}
Interview Type: ${interviewType}
Tech Stack: ${techStack || "Not specified"}
`;

    const response = await axios.post(
      SARVAM_API_URL,
      {
        model: "sarvam-m",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.6,
        max_tokens: 120,
        stream: false,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-subscription-key": process.env.SARVAM_API_KEY,
        },
        timeout: 20000,
      }
    );

    const text = response.data?.choices?.[0]?.message?.content?.trim();

    if (!text) throw new Error("Empty Sarvam response");

    return text;
  } catch (err) {
    console.error("⚠️ Sarvam Question Failed:", err.response?.data || err.message);

    return `Can you explain a core concept related to your role as a ${role} and how it is used in real-world applications?`;
  }
};
