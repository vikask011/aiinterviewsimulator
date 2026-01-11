import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Landing = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    company: "",
    role: "",
    experience: "",
    interviewType: "",
    techStack: "",
    questionLimit: "", // Changed from duration
  });

  const [loading, setLoading] = useState(false);

  const companies = [
    "Google", "Amazon", "Microsoft", "Meta", "Apple", 
    "Netflix", "Tesla", "Uber", "Airbnb", "Stripe",
    "Adobe", "Oracle", "IBM", "Salesforce", "Startup"
  ];

  const roles = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Data Analyst",
    "ML Engineer",
    "DevOps Engineer",
    "Product Manager",
    "UI/UX Designer"
  ];

  const experiences = [
    "0–1 years (Fresher)",
    "1–3 years (Mid)",
    "3–5 years (Senior)",
    "5+ years (Lead)"
  ];

  const interviewTypes = [
    "Technical",
    "HR",
    "Behavioral",
    "Mixed"
  ];

  // Updated to show numerical question limits
  const questionLimits = ["5", "10", "15", "20"];

  const handleSelect = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (field !== "techStack" && step < 6) {
      setTimeout(() => setStep(prev => prev + 1), 300);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const handleStartInterview = async () => {
    if (
      !form.company ||
      !form.role ||
      !form.experience ||
      !form.interviewType ||
      !form.questionLimit
    ) {
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

      // Sends form containing questionLimit to the backend
      const res = await axios.post(
        "http://localhost:5000/api/interview/start",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const interviewSessionId = res.data.interviewSessionId;
      navigate(`/interview/${interviewSessionId}`);
    } catch (error) {
      console.error("Interview start error:", error);
      alert(
        error.response?.data?.message ||
          "Failed to start interview. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="fade-in">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Which company are you interviewing for?
            </h2>
            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
              {companies.map((company) => (
                <button
                  key={company}
                  onClick={() => handleSelect("company", company)}
                  className={`p-4 rounded-lg border-2 transition-all hover:border-blue-500 hover:bg-blue-50 ${
                    form.company === company
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  <span className="font-medium">{company}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="fade-in">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              What role are you applying for?
            </h2>
            <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
              {roles.map((role) => (
                <button
                  key={role}
                  onClick={() => handleSelect("role", role)}
                  className={`p-4 rounded-lg border-2 transition-all hover:border-blue-500 hover:bg-blue-50 text-left ${
                    form.role === role
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  <span className="font-medium">{role}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="fade-in">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              What's your experience level?
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {experiences.map((exp) => (
                <button
                  key={exp}
                  onClick={() => handleSelect("experience", exp)}
                  className={`p-4 rounded-lg border-2 transition-all hover:border-blue-500 hover:bg-blue-50 text-left ${
                    form.experience === exp
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  <span className="font-medium">{exp}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="fade-in">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              What type of interview?
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {interviewTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => handleSelect("interviewType", type)}
                  className={`p-4 rounded-lg border-2 transition-all hover:border-blue-500 hover:bg-blue-50 ${
                    form.interviewType === type
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  <span className="font-medium">{type}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="fade-in">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Optional Requirement 
            </h2>
            <input
              type="text"
              value={form.techStack}
              onChange={(e) => setForm(prev => ({ ...prev, techStack: e.target.value }))}
              placeholder="e.g. Ask about Next.js"
              className="w-full p-4 border-2 border-gray-200 rounded-lg mb-4 focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={() => setStep(6)}
              className="w-full p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium"
            >
              Continue
            </button>
          </div>
        );

      case 6:
        return (
          <div className="fade-in">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Number of Questions
            </h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {questionLimits.map((limit) => (
                <button
                  key={limit}
                  onClick={() => handleSelect("questionLimit", limit)}
                  className={`p-4 rounded-lg border-2 transition-all hover:border-blue-500 hover:bg-blue-50 ${
                    form.questionLimit === limit
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  <span className="font-medium">{limit} Questions</span>
                </button>
              ))}
            </div>

            {form.questionLimit && (
              <>
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <h3 className="font-semibold mb-2 text-blue-700">Interview Summary:</h3>
                  <div className="text-sm space-y-1 text-gray-700">
                    <p><strong>Company:</strong> {form.company}</p>
                    <p><strong>Role:</strong> {form.role}</p>
                    <p><strong>Experience:</strong> {form.experience}</p>
                    <p><strong>Interview Type:</strong> {form.interviewType}</p>
                    {form.techStack && <p><strong>Tech Stack:</strong> {form.techStack}</p>}
                    <p><strong>Total Questions:</strong> {form.questionLimit}</p>
                  </div>
                </div>

                <button
                  onClick={handleStartInterview}
                  disabled={loading}
                  className={`w-full mt-4 p-4 rounded-lg text-lg font-semibold text-white shadow-lg transition-all ${
                    loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 active:scale-95"
                  }`}
                >
                  {loading ? "Preparing Session..." : "🚀 Start Interview"}
                </button>
              </>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <style>{`
        .fade-in {
          animation: fadeIn 0.3s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl border border-white">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-blue-600">
              Step {step} of 6
            </span>
            <span className="text-sm font-bold text-gray-400">
              {Math.round((step / 6) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min((step / 6) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation */}
        {step > 1 && (
          <button
            onClick={handleBack}
            className="mt-6 flex items-center text-gray-500 hover:text-blue-600 font-semibold transition-colors"
          >
            <span className="mr-1">←</span> Back to Step {step - 1}
          </button>
        )}
      </div>
    </div>
  );
};

export default Landing;