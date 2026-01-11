import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Mic, MicOff, Square, Play, LogOut, MessageSquare, User, Bot } from "lucide-react";

const Interview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const startedRef = useRef(false);
  const transcriptEndRef = useRef(null);

  const [transcript, setTranscript] = useState([]);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [recording, setRecording] = useState(false);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      initInterview();
    }
    return () => stopMedia();
  }, []);

  const stopMedia = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const initInterview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { width: 1280, height: 720 },
      });

      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setPermissionGranted(true);

      const token = localStorage.getItem("token");
      await fetch(`https://aiinterviewsimulator.vercel.app/api/interview/${id}/start`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchFirstQuestion();
    } catch (err) {
      setError("Camera/Microphone access is required.");
    }
  };

  const fetchFirstQuestion = async () => {
    setLoadingQuestion(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://aiinterviewsimulator.vercel.app/api/interview/${id}/first-question`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) handleAIResponse(data, false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingQuestion(false);
    }
  };

  const askNextQuestion = async () => {
    setLoadingQuestion(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://aiinterviewsimulator.vercel.app/api/interview/${id}/next-question`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.isFinished) {
        setTranscript(p => [...p, { type: "ai", text: "Interview Complete! Analyzing results..." }]);
        setTimeout(() => finishInterview(), 2000);
        return;
      }

      if (res.ok) handleAIResponse(data, false);
    } catch (err) {
      setError("Connection lost. Trying to reconnect...");
    } finally {
      setLoadingQuestion(false);
    }
  };

  const handleAIResponse = (data, isUpdate = false) => {
    if (data.currentNumber) {
      setProgress({ current: data.currentNumber, total: data.totalQuestions });
    }

    setTranscript((prev) => [...prev, { type: "ai", text: data.questionText }]);

    if (data.audio) {
      const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`);
      audio.play().catch(e => console.error(e));
    }
  };

  const startRecording = () => {
    if (loadingQuestion || error) return;
    audioChunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
    recorder.onstop = sendAnswer;
    recorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const sendAnswer = async () => {
    setLoadingQuestion(true);
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const token = localStorage.getItem("token");

      const res = await fetch(`https://aiinterviewsimulator.vercel.app/api/interview/${id}/answer`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "audio/webm",
        },
        body: audioBlob,
      });

      const data = await res.json();
      setTranscript((prev) => [...prev, { type: "user", text: data.answerText || "..." }]);
      askNextQuestion();
    } catch (err) {
      setError("Failed to upload answer.");
      setLoadingQuestion(false);
    }
  };

  const finishInterview = () => {
    const token = localStorage.getItem("token");
    fetch(`https://aiinterviewsimulator.vercel.app/api/interview/${id}/end`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    navigate(`/summary/${id}`);
  };

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-200 overflow-hidden font-sans">
      {/* MAIN VIEWPORT */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-6">
        
        {/* TOP OVERLAY: STATUS */}
        <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-10">
          <div className="flex items-center gap-3 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <div className={`w-2 h-2 rounded-full ${recording ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
            <span className="text-xs font-bold tracking-widest uppercase">
              {recording ? 'Live Recording' : 'AI Interviewer Ready'}
            </span>
          </div>
          
          {progress.total > 0 && (
            <div className="bg-blue-600/20 text-blue-400 backdrop-blur-md px-4 py-2 rounded-full border border-blue-500/30 text-xs font-black">
              QUESTION {progress.current} OF {progress.total}
            </div>
          )}
        </div>

        {/* VIDEO CONTAINER */}
        <div className="relative group w-full max-w-5xl h-full flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full max-h-[80vh] bg-slate-900 rounded-[2rem] shadow-2xl object-cover border border-white/5"
          />
          
          {/* AI Thinking Overlay */}
          {loadingQuestion && !recording && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] rounded-[2rem] flex flex-col items-center justify-center">
              <div className="flex gap-1 mb-4">
                {[1,2,3].map(i => (
                  <div key={i} className="w-1.5 h-8 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: `${i*0.1}s` }} />
                ))}
              </div>
              <p className="text-sm font-medium text-blue-200 animate-pulse uppercase tracking-widest">AI is processing...</p>
            </div>
          )}
        </div>

        {/* BOTTOM CONTROLS */}
        <div className="absolute bottom-10 flex items-center gap-6 bg-slate-900/80 backdrop-blur-2xl p-4 rounded-3xl border border-white/10 shadow-2xl">
          <button
            onClick={recording ? stopRecording : startRecording}
            disabled={loadingQuestion}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black transition-all active:scale-95 ${
              recording 
              ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20" 
              : "bg-white hover:bg-slate-100 text-slate-900 disabled:bg-slate-700"
            }`}
          >
            {recording ? <Square size={20} fill="currentColor" /> : <Mic size={20} />}
            {recording ? "STOP RECORDING" : "START ANSWER"}
          </button>

          <div className="h-10 w-px bg-white/10" />

          <button
            onClick={finishInterview}
            className="p-4 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all"
            title="End Interview"
          >
            <LogOut size={24} />
          </button>
        </div>
      </div>

      {/* RIGHT PANEL: TRANSCRIPT */}
      <div className="w-[400px] bg-slate-900/50 border-l border-white/5 backdrop-blur-xl flex flex-col shadow-2xl">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <MessageSquare size={20} className="text-blue-500" />
          <h2 className="font-black text-sm uppercase tracking-widest">Live Transcript</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {transcript.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center px-6">
              <Bot size={40} className="mb-4 opacity-20" />
              <p className="text-sm italic">The interview conversation will appear here in real-time.</p>
            </div>
          )}
          
          {transcript.map((item, idx) => (
            <div key={idx} className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500`}>
              <div className={`mt-1 p-1.5 rounded-lg h-fit ${item.type === 'ai' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {item.type === 'ai' ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className="space-y-1 flex-1">
                <p className={`text-[10px] font-black uppercase tracking-tighter ${item.type === 'ai' ? 'text-blue-500' : 'text-emerald-500'}`}>
                  {item.type === 'ai' ? 'Interviewer' : 'You'}
                </p>
                <div className={`text-sm leading-relaxed ${item.type === 'ai' ? 'text-slate-200' : 'text-slate-400 italic'}`}>
                  {item.text}
                </div>
              </div>
            </div>
          ))}
          <div ref={transcriptEndRef} />
        </div>

        {error && (
          <div className="m-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold text-center">
            {error}
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default Interview;