import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Building2, 
  ChevronLeft, 
  Rocket, 
  Globe, 
  ShieldCheck, 
  Zap,
  ArrowRight,
  Briefcase,
  Users
} from "lucide-react";

const StartPractice = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    company: "", // This will now store the Category/Tier name
    role: "",
    experience: "",
    interviewType: "",
    techStack: "",
    questionLimit: "",
  });

  // --- REFACTORED COMPANY TYPES ---
  const companyTypes = [
    {
      id: "big-tech",
      title: "Big Tech ",
      description: "Focus on scale, algorithms, and deep system design.",
      icon: <ShieldCheck size={24} className="text-blue-600" />,
      tag: "Competitive"
    },
    {
      id: "unicorn",
      title: "High-Growth Unicorn",
      description: "Fast-paced, product-focused, and high-ownership roles.",
      icon: <Zap size={24} className="text-amber-500" />,
      tag: "Fast-Paced"
    },
    {
      id: "enterprise",
      title: "Enterprise & Fortune 500",
      description: "Stable processes, domain expertise, and standard practices.",
      icon: <Building2 size={24} className="text-slate-500" />,
      tag: "Standard"
    },
    {
      id: "startup",
      title: "Early Stage Startup",
      description: "Generalist roles, rapid prototyping, and 0-to-1 build.",
      icon: <Rocket size={24} className="text-purple-500" />,
      tag: "Aggressive"
    }
  ];

  const roles = ["Frontend Developer", "Backend Developer", "Full Stack Developer", "Data Analyst", "ML Engineer", "DevOps Engineer", "Product Manager", "UI/UX Designer"];
  const experiences = ["0–1 years (Fresher)", "1–3 years (Mid)", "3–5 years (Senior)", "5+ years (Lead)"];
  const interviewTypes = ["Technical", "HR", "Behavioral", "Mixed"];
  const questionLimits = ["5", "10", "15", "20"];

  const handleSelect = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (field !== "techStack" && step < 6) {
      setTimeout(() => setStep(prev => prev + 1), 400);
    }
  };

  const handleBack = () => step > 1 && setStep(prev => prev - 1);

  const handleStartInterview = async () => {
    if (!form.company || !form.role || !form.experience || !form.interviewType || !form.questionLimit) {
      alert("Please complete all steps");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Session expired. Please login again.");
        navigate("/login");
        return;
      }

      const res = await axios.post("http://localhost:5000/api/interview/start", form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate(`/interview/${res.data.interviewSessionId}`);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to start interview.");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="fade-in space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Company Environment</h2>
              <p className="text-slate-500 text-sm">Tailor the AI to a specific interview culture</p>
            </div>
            <div className="space-y-3">
              {companyTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleSelect("company", type.title)}
                  className={`w-full group relative p-5 rounded-2xl border-2 text-left transition-all duration-300 ${
                    form.company === type.title 
                    ? "border-blue-600 bg-blue-50/50 ring-4 ring-blue-50" 
                    : "border-slate-100 hover:border-blue-200 hover:bg-white hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl transition-colors ${form.company === type.title ? 'bg-white shadow-sm' : 'bg-slate-50 group-hover:bg-blue-50'}`}>
                      {type.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{type.title}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                          {type.tag}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{type.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="fade-in">
            <h2 className="text-2xl font-black text-slate-800 text-center mb-6 tracking-tight">Target Position</h2>
            <div className="grid grid-cols-1 gap-3">
              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => handleSelect("role", r)}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all group ${
                    form.role === r ? "border-blue-600 bg-blue-50 text-blue-700 font-bold" : "border-slate-100 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Briefcase size={18} className={form.role === r ? "text-blue-600" : "text-slate-300"} />
                    <span>{r}</span>
                  </div>
                  <ArrowRight size={16} className={`transition-all ${form.role === r ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"}`} />
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
      case 4:
        const list = step === 3 ? experiences : interviewTypes;
        const field = step === 3 ? "experience" : "interviewType";
        return (
          <div className="fade-in text-center">
            <h2 className="text-2xl font-black text-slate-800 mb-6 tracking-tight">{step === 3 ? "Your Experience" : "Interview Style"}</h2>
            <div className="grid grid-cols-1 gap-4">
              {list.map((item) => (
                <button
                  key={item}
                  onClick={() => handleSelect(field, item)}
                  className={`p-5 rounded-3xl border-2 font-bold transition-all transform active:scale-95 ${
                    form[field] === item ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200" : "border-slate-100 text-slate-500 hover:border-blue-200 hover:text-slate-700 shadow-sm bg-white"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="fade-in">
            <h2 className="text-2xl font-black text-slate-800 text-center mb-2 tracking-tight">Additional Context</h2>
            <p className="text-center text-slate-400 text-sm mb-6">Mention specific stacks, projects, or topics</p>
            <textarea
              value={form.techStack}
              onChange={(e) => setForm(prev => ({ ...prev, techStack: e.target.value }))}
              placeholder="e.g. Ask questions related to Kubernetes and AWS microservices..."
              className="w-full h-40 p-5 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:border-blue-500 focus:bg-white focus:outline-none transition-all resize-none font-medium text-slate-700"
            />
            <button
              onClick={() => setStep(6)}
              className="w-full mt-6 p-5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
            >
              Set Session Length
            </button>
          </div>
        );

      case 6:
        return (
          <div className="fade-in">
            <h2 className="text-2xl font-black text-slate-800 text-center mb-6 tracking-tight">Total Questions</h2>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {questionLimits.map((limit) => (
                <button
                  key={limit}
                  onClick={() => handleSelect("questionLimit", limit)}
                  className={`p-6 rounded-[2.5rem] border-2 flex flex-col items-center gap-1 transition-all ${
                    form.questionLimit === limit ? "border-blue-600 bg-blue-50 text-blue-700 shadow-md ring-2 ring-blue-100" : "border-slate-100 text-slate-400 hover:border-slate-200 bg-white"
                  }`}
                >
                  <span className="text-4xl font-black">{limit}</span>
                  <span className="text-[10px] uppercase font-black tracking-[0.2em]">Questions</span>
                </button>
              ))}
            </div>

            {form.questionLimit && (
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl animate-in zoom-in-95 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Globe size={120} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-6 text-blue-400">
                    <Users size={18} />
                    <span className="text-xs font-bold uppercase tracking-widest">Interview Summary</span>
                  </div>
                  <div className="space-y-4 text-sm mb-8">
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Environment</span> <span className="font-bold">{form.company}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Role</span> <span className="font-bold">{form.role}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Level</span> <span className="font-bold">{form.experience}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleStartInterview}
                    disabled={loading}
                    className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 disabled:bg-slate-700 shadow-lg shadow-blue-900/40"
                  >
                    {loading ? "PREPARING AGENT..." : "START SESSION"}
                    {!loading && <Rocket size={22} />}
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-6">
      <style>{`
        .fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      
      <div className="bg-white p-10 rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] w-full max-w-xl border border-white relative">
        {/* Sleek Progress Top Bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-50 rounded-t-[3rem] overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-700 ease-out"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>

        {/* Improved Navigation */}
        <div className="flex justify-between items-center mb-8">
          {step > 1 ? (
            <button onClick={handleBack} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors font-bold text-sm group">
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              Go Back
            </button>
          ) : <div />}
          <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-tighter">
            Phase 0{step}
          </span>
        </div>

        <div className="mt-2 min-h-[450px]">
          {renderStepContent()}
        </div>

        {/* Aesthetic Dot Indicator */}
        <div className="mt-10 flex justify-center gap-1.5">
          {[1,2,3,4,5,6].map(s => (
            <div key={s} className={`h-1 rounded-full transition-all duration-500 ${step === s ? 'w-10 bg-blue-600' : 'w-2 bg-slate-100'}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StartPractice;