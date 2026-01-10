//gemini.service.js
import axios from "axios";

export const generateQuestion = async ({
  company,
  role,
  experience,
  interviewType,
  techStack,
}) => {
  const prompt = `
You are an AI interviewer conducting a LIVE SPOKEN interview.

Rules you MUST follow:
- Do NOT ask coding or programming questions.
- Do NOT ask the candidate to write code.
- Ask ONLY conceptual, verbal, or explanation-based questions.
- Questions must be answerable by speaking.

Context:
Company: ${company}
Role: ${role}
Experience: ${experience}
Interview Type: ${interviewType}
Tech Stack: ${techStack || "Not specified"}

Ask ONE clear interview question.
Return ONLY the question text.
`;

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
    }
  );

  return response.data.candidates[0].content.parts[0].text;
};
