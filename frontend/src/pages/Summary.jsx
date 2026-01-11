import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  FileText, 
  RefreshCcw, 
  CheckCircle, 
  TrendingUp, 
  Target, 
  BookOpen, 
  AlertCircle,
  Loader2
} from "lucide-react";

const Summary = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [loadingText, setLoadingText] = useState("Analyzing your performance...");
  const hasRunRef = useRef(false);
  const reportRef = useRef(null);

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;
    endInterviewThenFetch();
  }, []);

  const endInterviewThenFetch = async () => {
    try {
      const token = localStorage.getItem("token");
      const endRes = await fetch(`https://aiinterviewsimulator.vercel.app/api/interview/${id}/end`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const endData = await endRes.json();

      if (endData.status === "processing") {
        setLoadingText("Finalizing your personalized report...");
        setTimeout(endInterviewThenFetch, 2500);
        return;
      }

      const summaryRes = await fetch(`https://aiinterviewsimulator.vercel.app/api/interview/${id}/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!summaryRes.ok) throw new Error("Summary data is still being processed.");

      const summaryData = await summaryRes.json();
      setSummary(summaryData.summary);
    } catch (err) {
      setError(err.message || "Unable to load summary.");
    }
  };

  const handleDownloadPDF = () => {
    // Standard professional approach: use window.print with @media print CSS
    // This is the most reliable way to generate a PDF across all browsers
    window.print();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md text-center border border-red-100">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Something went wrong</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-lg font-medium text-slate-700">{loadingText}</p>
        <p className="text-sm text-slate-400 mt-2">This usually takes about 5-10 seconds</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto" ref={reportRef}>
        
        {/* HEADER SECTION */}
        <div className="bg-white rounded-3xl p-8 mb-8 shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider">
                Analysis Complete
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">Interview Summary</h1>
            <p className="text-slate-500 mt-1">Review your performance and key improvement areas.</p>
          </div>
          <div className="flex gap-3 no-print">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-5 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all border border-slate-200"
            >
              <FileText size={18} />
              PDF
            </button>
            <button
              onClick={() => navigate("/home")}
              className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
            >
              <RefreshCcw size={18} />
              New Session
            </button>
          </div>
        </div>

        {/* FEEDBACK HIGHLIGHT */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 mb-8 text-white shadow-xl">
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            <Target size={22} />
            Overall Feedback
          </h2>
          <p className="text-blue-50 text-lg leading-relaxed opacity-95">
            {summary.overallFeedback}
          </p>
        </div>

        {/* DETAILED ANALYSIS GRID */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <SummaryCard 
            title="Key Strengths" 
            items={summary.strengths} 
            icon={<CheckCircle className="text-emerald-500" />} 
            bgColor="bg-emerald-50/50"
            borderColor="border-emerald-100"
          />
          <SummaryCard 
            title="Improvement Areas" 
            items={summary.weaknesses} 
            icon={<TrendingUp className="text-amber-500" />} 
            bgColor="bg-amber-50/50" 
            borderColor="border-amber-100"
          />
          <SummaryCard 
            title="Action Items" 
            items={summary.improvements} 
            icon={<RefreshCcw className="text-blue-500" />} 
            bgColor="bg-blue-50/50"
            borderColor="border-blue-100"
          />
          <SummaryCard 
            title="Topics to Study" 
            items={summary.topicsToWorkOn} 
            icon={<BookOpen className="text-purple-500" />} 
            bgColor="bg-purple-50/50"
            borderColor="border-purple-100"
          />
        </div>

        {/* FOOTER INFO (Print Only) */}
        <div className="hidden print:block mt-12 text-center text-slate-400 text-xs border-t pt-8">
          Generated by AI Interviewer • {new Date().toLocaleDateString()}
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background-color: white !important; padding: 0 !important; }
          .max-w-4xl { max-width: 100% !important; margin: 0 !important; }
          .shadow-xl, .shadow-sm { shadow: none !important; border: 1px solid #e2e8f0 !important; }
          .rounded-3xl { border-radius: 12px !important; }
        }
      `}</style>
    </div>
  );
};

/* ===========================
    SUB-COMPONENT: CARD
=========================== */
const SummaryCard = ({ title, items = [], icon, bgColor, borderColor }) => {
  return (
    <div className={`p-6 rounded-3xl border ${borderColor} ${bgColor} flex flex-col h-full`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-white rounded-xl shadow-sm">
          {icon}
        </div>
        <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
      </div>
      {items && items.length > 0 ? (
        <ul className="space-y-3 flex-1">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-slate-600 text-sm leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-slate-400 italic text-sm">Nothing recorded for this section.</p>
      )}
    </div>
  );
};

export default Summary;