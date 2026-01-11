import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Briefcase, 
  Building2, 
  Settings2, 
  Calendar, 
  ArrowRight, 
  Plus, 
  History,
  Trophy,
  Layout
} from "lucide-react";

const Profile = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyInterviews();
  }, []);

  const fetchMyInterviews = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        "https://aiinterviewsimulator.vercel.app/api/interview/my-interviews",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setInterviews(data.interviews);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
          <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute text-2xl">🤖</div>
        </div>
        <p className="mt-4 text-slate-500 font-medium animate-pulse">Analyzing your progress...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* --- TOP COVER BREADCRUMB --- */}
      <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 w-full"></div>

      <div className="max-w-6xl mx-auto px-6 -mt-16">
        {/* --- HEADER SECTION --- */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center text-4xl shadow-inner border border-white">
                👤
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  My Interviews
                </h1>
                <p className="text-slate-500 mt-1 flex items-center gap-2">
                  <History size={16} />
                  {interviews.length > 0
                    ? `Reviewing your ${interviews.length} past sessions`
                    : "Your interview history will appear here"}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => navigate("/home")}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
            >
              <Plus size={20} />
              New Interview
            </button>
          </div>

          {/* --- QUICK STATS --- */}
          {interviews.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
              <StatCard 
                label="Total Sessions" 
                value={interviews.length} 
                icon={<Layout className="text-blue-600" size={20}/>}
                bgColor="bg-blue-50"
              />
              <StatCard 
                label="Companies" 
                value={new Set(interviews.map((i) => i.company)).size} 
                icon={<Building2 className="text-emerald-600" size={20}/>}
                bgColor="bg-emerald-50"
              />
              <StatCard 
                label="Roles Tested" 
                value={new Set(interviews.map((i) => i.role)).size} 
                icon={<Trophy className="text-amber-600" size={20}/>}
                bgColor="bg-amber-50"
              />
            </div>
          )}
        </div>

        {/* --- CONTENT AREA --- */}
        {interviews.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-16 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase size={40} className="text-slate-300" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">No history found</h2>
            <p className="text-slate-500 max-w-sm mx-auto mt-2 mb-8">
              Take your first AI-powered mock interview to see your performance metrics here.
            </p>
            <button
              onClick={() => navigate("/home")}
              className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition"
            >
              Start Practice Session
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interviews.map((interview) => (
              <div
                key={interview._id}
                className="group bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xl shadow-lg group-hover:bg-blue-600 transition-colors">
                    {interview.company.charAt(0)}
                  </div>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-lg">
                    {interview.interviewType || "Technical"}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {interview.company}
                </h3>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <Briefcase size={14} className="text-slate-400" />
                    <span className="font-medium">{interview.role}</span>
                  </div>
                  {interview.techStack && (
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Settings2 size={14} className="text-slate-400" />
                      <span className="truncate">{interview.techStack}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-400 text-[12px] pt-2">
                    <Calendar size={12} />
                    <span>
                      {new Date(interview.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/summary/${interview._id}`)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-700 rounded-xl font-bold group-hover:bg-blue-50 group-hover:text-blue-700 transition-all"
                >
                  View Analysis
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* --- HELPER COMPONENTS --- */
const StatCard = ({ label, value, icon, bgColor }) => (
  <div className={`p-5 rounded-2xl border border-white shadow-sm flex items-center gap-4 ${bgColor}`}>
    <div className="bg-white p-3 rounded-xl shadow-sm">
      {icon}
    </div>
    <div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-black text-slate-900">{value}</p>
    </div>
  </div>
);

export default Profile;