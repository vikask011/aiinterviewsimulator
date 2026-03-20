# 🎙️ AI Interview Simulator

An AI-powered mock interview platform that simulates real job interviews using voice. Ask questions, listen to your answers, and get detailed feedback — all powered by **Sarvam AI** and **Deepgram**.


🔗 **Live Demo:** [aiinterviewsimulator-fmm9.vercel.app](https://aiinterviewsimulator-fmm9.vercel.app)

---

## ✨ Features

- 🎤 **Voice-Based Interviews** — Speak your answers; Deepgram transcribes them in real time
- 🤖 **AI Question Generation** — Sarvam AI generates contextual, non-repetitive interview questions
- 🔊 **Text-to-Speech** — Questions are read aloud using Deepgram's Aura voice engine
- 📊 **Interview Summary** — Get strengths, weaknesses, improvements, and topics to work on after each session
- 🔐 **Auth System** — Secure JWT-based signup/login
- 🏢 **Company Type Selection** — Big Tech, Unicorn, Enterprise, Startup, Government, and more
- 🎯 **Customizable Sessions** — Choose role, experience level, interview type, tech stack, and number of questions
- 📁 **Interview History** — View all past interviews and their summaries from your profile

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite | Build tool |
| React Router v7 | Client-side routing |
| Tailwind CSS v4 | Styling |
| Axios | API requests |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express 5 | Server framework |
| MongoDB + Mongoose | Database |
| JWT + bcryptjs | Authentication |
| Sarvam AI | Question generation (primary) |
| Deepgram | Speech-to-text & text-to-speech |
| Vercel | Deployment (serverless) |

---

## ⚙️ Environment Variables

### Backend `.env`
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
DEEPGRAM_API_KEY=your_deepgram_api_key
SARVAM_API_KEY=your_sarvam_api_key
```

### Frontend `.env`
```env
VITE_API_URL=https://your-backend-url.vercel.app
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repository
```bash
git clone https://github.com/vikask011/aiinterviewsimulator.git
cd aiinterviewsimulator
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder and add your environment variables (see above).

```bash
node server.js
```

### 3. Setup Frontend
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` folder and set `VITE_API_URL` to your backend URL.

```bash
npm run dev
```

The app will be running at `http://localhost:5173`

---

## 🗺️ App Flow

```
Signup / Login
      ↓
  Dashboard (Home)
      ↓
 Start Practice → Select Company Type → Fill Details → Set Question Limit
      ↓
 Live Interview → AI speaks question → User answers via microphone
      ↓
 Deepgram transcribes answer → Sarvam AI generates next question
      ↓
 End Interview → AI generates summary
      ↓
 Summary Page → Strengths / Weaknesses / Topics to Work On
```

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the project
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

> ⭐ If you found this project helpful, please give it a star on GitHub!
