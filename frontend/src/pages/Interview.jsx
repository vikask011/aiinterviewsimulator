import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

const Interview = () => {
  const { id } = useParams();

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

  /* =========================
     INIT (RUN ONCE)
  ========================= */
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    initInterview();

    return () => stopMedia();
  }, []);

  /* =========================
     INITIALIZE INTERVIEW
  ========================= */
  const initInterview = async () => {
    try {
      // 🎥 Lightweight media (audio-first)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { width: 320, height: 240 },
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      setPermissionGranted(true);

      const token = localStorage.getItem("token");

      // 🔥 BEGIN interview (do NOT block UI)
      fetch(`http://localhost:5000/api/interview/${id}/start`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // 🔥 Ask first question immediately
      askNextQuestion();
    } catch (err) {
      console.error(err);
      setError("Failed to initialize interview");
    }
  };

  const stopMedia = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  /* =========================
     ASK AI QUESTION (FAST)
  ========================= */
  const askNextQuestion = async () => {
    setLoadingQuestion(true);
    setError(null);

    // ⚡ Instant UI feedback
    setTranscript((prev) => [
      ...prev,
      { type: "ai", text: "🤖 Thinking..." },
    ]);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/api/interview/${id}/next-question`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      // 🔁 Replace placeholder
      setTranscript((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          type: "ai",
          text: data.questionText,
        };
        return copy;
      });

      setLoadingQuestion(false);

      // 🔊 Play audio async
      if (data.audio) {
        const audio = new Audio(
          URL.createObjectURL(
            new Blob(
              [Uint8Array.from(atob(data.audio), (c) => c.charCodeAt(0))],
              { type: "audio/mpeg" }
            )
          )
        );
        audio.play();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to generate AI question");
      setLoadingQuestion(false);
    }
  };

  /* =========================
     RECORD ANSWER
  ========================= */
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
      setLoadingQuestion(true); // instant feedback
    }
  };

  const sendAnswer = async () => {
    try {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });

      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/api/interview/${id}/answer`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "audio/webm",
          },
          body: audioBlob,
        }
      );

      const data = await res.json();

      setTranscript((prev) => [
        ...prev,
        { type: "user", text: data.answerText },
      ]);

      // 🔥 Do NOT await — keep UI responsive
      askNextQuestion();
    } catch (err) {
      console.error(err);
      setError("Failed to submit answer");
      setLoadingQuestion(false);
    }
  };

  /* =========================
     CANCEL (INSTANT)
  ========================= */
  const cancelInterview = () => {
    const token = localStorage.getItem("token");

    // fire & forget
    fetch(`http://localhost:5000/api/interview/${id}/end`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    window.location.href = `/summary/${id}`;
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="flex h-screen">
      {/* LEFT */}
      <div className="w-1/3 bg-gray-100 p-4 overflow-y-auto">
        <h2 className="font-bold mb-4">Interview Transcript</h2>

        {transcript.map((item, idx) => (
          <div key={idx} className="mb-3">
            <p
              className={`font-semibold ${
                item.type === "ai"
                  ? "text-blue-600"
                  : "text-green-600"
              }`}
            >
              {item.type === "ai" ? "AI" : "You"}
            </p>
            <p>{item.text}</p>
          </div>
        ))}

        {loadingQuestion && (
          <p className="text-sm text-gray-500 mt-4">
            Processing…
          </p>
        )}

        {error && (
          <p className="text-sm text-red-600 mt-4">
            ⚠ {error}
          </p>
        )}
      </div>

      {/* RIGHT */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-[400px] bg-black rounded mb-6"
        />

        {permissionGranted && (
          <button
            onClick={recording ? stopRecording : startRecording}
            disabled={loadingQuestion || !!error}
            className={`px-6 py-3 rounded text-white ${
              recording
                ? "bg-red-600"
                : loadingQuestion || error
                ? "bg-gray-400"
                : "bg-green-600"
            }`}
          >
            {recording ? "Stop Answer" : "Start Answer"}
          </button>
        )}

        <button
          onClick={cancelInterview}
          className="mt-4 px-6 py-2 bg-gray-800 text-white rounded"
        >
          Cancel Interview
        </button>
      </div>
    </div>
  );
};

export default Interview;
