import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

const Summary = () => {
  const { id } = useParams();

  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [loadingText, setLoadingText] = useState(
    "🧠 Generating interview summary..."
  );

  // 🔒 Prevent double execution (React 18 strict mode)
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    endInterviewThenFetch();
  }, []);

  const endInterviewThenFetch = async () => {
    try {
      const token = localStorage.getItem("token");

      /* ===========================
         STEP 1: END INTERVIEW
      ============================ */
      const endRes = await fetch(
        `http://localhost:5000/api/interview/${id}/end`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const endData = await endRes.json();

      // ⏳ Summary still generating → retry
      if (endData.status === "processing") {
        setLoadingText("⏳ Finalizing summary, please wait...");
        setTimeout(endInterviewThenFetch, 2000);
        return;
      }

      /* ===========================
         STEP 2: FETCH SUMMARY
      ============================ */
      const summaryRes = await fetch(
        `http://localhost:5000/api/interview/${id}/summary`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!summaryRes.ok) {
        throw new Error("Summary not ready");
      }

      const summaryData = await summaryRes.json();
      setSummary(summaryData.summary);
    } catch (err) {
      console.error("❌ Summary Fetch Error:", err);
      setError("Unable to load interview summary. Please try again.");
    }
  };

  /* ===========================
     UI STATES
  ============================ */
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto">
              <svg className="animate-spin" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#3b82f6"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray="200"
                  strokeDashoffset="50"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl">
              🧠
            </div>
          </div>
          <p className="text-xl font-semibold text-gray-800 mb-2">
            {loadingText}
          </p>
          <p className="text-sm text-gray-600">
            This may take a few seconds…
          </p>
        </div>
      </div>
    );
  }

  /* ===========================
     SUMMARY VIEW
  ============================ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 text-center">
          <div className="text-5xl mb-3">🎯</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Interview Summary
          </h1>
          <p className="text-gray-600">
            Here's your personalized performance analysis
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Section
            title="💪 Strengths"
            items={summary.strengths}
            color="green"
            icon="✓"
          />
          <Section
            title="🎯 Areas for Improvement"
            items={summary.weaknesses}
            color="orange"
            icon="!"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Section
            title="📈 Action Items"
            items={summary.improvements}
            color="blue"
            icon="→"
          />
          <Section
            title="📚 Topics to Study"
            items={summary.topicsToWorkOn}
            color="purple"
            icon="📖"
          />
        </div>

        {/* Overall Feedback */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-3xl">💬</div>
            <h2 className="text-2xl font-bold text-gray-800">
              Overall Feedback
            </h2>
          </div>
          <p className="text-gray-700 text-lg leading-relaxed">
            {summary.overallFeedback}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mt-8">
          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-medium"
          >
            📄 Download PDF
          </button>
          <button
            onClick={() => (window.location.href = "/landing")}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg font-medium"
          >
            🔄 Start New Interview
          </button>
        </div>
      </div>
    </div>
  );
};

/* ===========================
   REUSABLE SECTION WITH COLOR THEMES
=========================== */
const Section = ({ title, items = [], color, icon }) => {
  const colorClasses = {
    green: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
      iconBg: "bg-green-100",
      iconText: "text-green-600",
    },
    orange: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-800",
      iconBg: "bg-orange-100",
      iconText: "text-orange-600",
    },
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      iconBg: "bg-blue-100",
      iconText: "text-blue-600",
    },
    purple: {
      bg: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-800",
      iconBg: "bg-purple-100",
      iconText: "text-purple-600",
    },
  };

  const theme = colorClasses[color] || colorClasses.blue;

  return (
    <div
      className={`${theme.bg} border-2 ${theme.border} rounded-2xl p-6 shadow-lg transition-all hover:shadow-xl`}
    >
      <h2 className={`text-xl font-bold ${theme.text} mb-4`}>{title}</h2>
      {items.length > 0 ? (
        <ul className="space-y-3">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span
                className={`${theme.iconBg} ${theme.iconText} w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm mt-0.5`}
              >
                {icon}
              </span>
              <span className="text-gray-700 leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 italic">No items to display</p>
      )}
    </div>
  );
};

export default Summary;