import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const Interview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const startedRef = useRef(false);

  const [transcript, setTranscript] = useState([]);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [recording, setRecording] = useState(false);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [error, setError] = useState(null);
  
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  /* =========================
      CLEANUP & INIT
  ========================= */
  useEffect(() => {
    // Only initialize once
    if (!startedRef.current) {
      startedRef.current = true;
      initInterview();
    }

    // ✅ CRITICAL: This runs when the user navigates away or closes the component
    return () => {
      console.log("Cleaning up media tracks...");
      stopMedia();
    };
  }, []);

  const stopMedia = () => {
    // 1. Stop the recorder if it's running
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    // 2. Stop all camera and mic tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop(); // Stops the hardware (camera light goes off)
        console.log(`Stopped track: ${track.kind}`);
      });
      streamRef.current = null;
    }

    // 3. Clear the video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  /* =========================
      INITIALIZE INTERVIEW
  ========================= */
  const initInterview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { width: 480, height: 360 },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setPermissionGranted(true);

      const token = localStorage.getItem("token");

      await fetch(`http://localhost:5000/api/interview/${id}/start`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchFirstQuestion();
    } catch (err) {
      console.error(err);
      setError("Camera/Microphone access is required for the interview.");
    }
  };

  /* =========================
      AI QUESTION HANDLERS
  ========================= */
  const fetchFirstQuestion = async () => {
    setLoadingQuestion(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/interview/${id}/first-question`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (res.ok) {
        handleAIResponse(data, false);
      } else {
        throw new Error(data.message || "Failed to initiate session");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingQuestion(false);
    }
  };

  const askNextQuestion = async () => {
    setLoadingQuestion(true);
    setTranscript((prev) => [...prev, { type: "ai", text: "🤖 Thinking..." }]);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/interview/${id}/next-question`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.isFinished) {
        setTranscript((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { type: "ai", text: "Interview Complete! Redirecting to summary..." };
          return copy;
        });
        setTimeout(() => finishInterview(), 2000);
        return;
      }

      if (res.ok) {
        handleAIResponse(data, true);
      } else {
        throw new Error(data.message || "Failed to fetch next question");
      }
    } catch (err) {
      console.error(err);
      setError("Connection error. Please try again.");
    } finally {
      setLoadingQuestion(false);
    }
  };

  const handleAIResponse = (data, isUpdate = false) => {
    if (data.currentNumber && data.totalQuestions) {
        setProgress({ current: data.currentNumber, total: data.totalQuestions });
    }

    setTranscript((prev) => {
      if (isUpdate) {
        const copy = [...prev];
        copy[copy.length - 1] = { type: "ai", text: data.questionText };
        return copy;
      }
      return [...prev, { type: "ai", text: data.questionText }];
    });

    if (data.audio) {
      const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`);
      audio.play().catch(e => console.error("Audio play failed:", e));
    }
  };

  /* =========================
      RECORDING LOGIC
  ========================= */
  const startRecording = () => {
    if (loadingQuestion || error) return;
    audioChunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };
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

      const res = await fetch(`http://localhost:5000/api/interview/${id}/answer`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "audio/webm",
        },
        body: audioBlob,
      });

      const data = await res.json();
      setTranscript((prev) => [
        ...prev,
        { type: "user", text: data.answerText || "(No speech detected)" },
      ]);

      askNextQuestion();
    } catch (err) {
      setError("Failed to process your answer.");
      setLoadingQuestion(false);
    }
  };

  /* =========================
      FINISH
  ========================= */
  const finishInterview = () => {
    const token = localStorage.getItem("token");
    fetch(`http://localhost:5000/api/interview/${id}/end`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    // stopMedia will be called automatically by useEffect cleanup
    navigate(`/summary/${id}`);
  };

  return (
    <div className="flex h-screen bg-white">
      {/* LEFT PANEL */}
      <div className="w-1/3 border-r bg-gray-50 flex flex-col">
        <div className="p-4 border-b bg-white flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Transcript</h2>
          {progress.total > 0 && (
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
              Q: {progress.current} / {progress.total}
            </span>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {transcript.map((item, idx) => (
            <div key={idx} className={`flex flex-col ${item.type === "ai" ? "items-start" : "items-end"}`}>
              <span className={`text-[10px] font-bold uppercase mb-1 ${item.type === "ai" ? "text-blue-500" : "text-green-500"}`}>
                {item.type === "ai" ? "Interviewer" : "You"}
              </span>
              <div className={`max-w-[90%] p-3 rounded-xl shadow-sm text-sm ${item.type === "ai" ? "bg-white border text-gray-800" : "bg-green-600 text-white"}`}>
                {item.text}
              </div>
            </div>
          ))}
          {loadingQuestion && !recording && (
            <div className="flex items-center text-gray-400 italic text-xs animate-pulse">
              AI is preparing the next question...
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-100">
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-[600px] aspect-video bg-black rounded-3xl shadow-2xl border-4 border-white object-cover"
          />
          {recording && (
            <div className="absolute top-6 right-6 flex items-center bg-red-600 text-white px-4 py-2 rounded-full animate-pulse shadow-lg">
              <div className="w-2.5 h-2.5 bg-white rounded-full mr-2"></div>
              <span className="text-xs font-bold tracking-wider">RECORDING</span>
            </div>
          )}
          {progress.total > 0 && (
            <div className="absolute bottom-6 left-6 bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm border border-white/20">
                Progress: {Math.round((progress.current / progress.total) * 100)}%
            </div>
          )}
        </div>

        <div className="mt-12 flex flex-col items-center w-full max-w-md">
          {permissionGranted ? (
            <div className="flex space-x-6 w-full">
              <button
                onClick={recording ? stopRecording : startRecording}
                disabled={loadingQuestion}
                className={`flex-1 py-4 rounded-2xl font-bold text-lg shadow-xl transition-all active:scale-95 ${
                  recording ? "bg-red-500 hover:bg-red-600 text-white" : "bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-300"
                }`}
              >
                {recording ? "Stop & Submit" : "Start Answer"}
              </button>

              <button
                onClick={finishInterview}
                className="px-8 py-4 bg-gray-800 hover:bg-black text-white rounded-2xl font-bold shadow-lg transition-all"
              >
                End
              </button>
            </div>
          ) : (
            <div className="text-center p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
               Please enable your camera and microphone to start.
            </div>
          )}

          {error && (
            <div className="mt-6 w-full p-4 bg-red-100 border border-red-200 text-red-700 rounded-2xl text-center text-sm font-medium">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Interview;