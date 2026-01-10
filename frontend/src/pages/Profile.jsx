import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
        "http://localhost:5000/api/interview/my-interviews",
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 mx-auto">
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
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl">
              📊
            </div>
          </div>
          <p className="text-lg font-semibold text-gray-700">
            Loading your interviews...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                My Interviews
              </h1>
              <p className="text-gray-600">
                {interviews.length > 0
                  ? `You've completed ${interviews.length} interview${
                      interviews.length !== 1 ? "s" : ""
                    }`
                  : "Start your interview journey today"}
              </p>
            </div>
            <div className="text-6xl">👤</div>
          </div>

          {/* Stats Cards */}
          {interviews.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {interviews.length}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Total Interviews
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl text-center">
                <div className="text-3xl font-bold text-green-600">
                  {
                    new Set(interviews.map((i) => i.company))
                      .size
                  }
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Companies
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {new Set(interviews.map((i) => i.role)).size}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Roles
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {interviews.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-8xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No Interviews Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Ready to practice? Start your first mock interview now!
            </p>
            <button
              onClick={() => navigate("/landing")}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-semibold"
            >
              Start Interview
            </button>
          </div>
        )}

        {/* Interviews Grid */}
        {interviews.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interviews.map((interview) => (
              <div
                key={interview._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 border-2 border-gray-100 hover:border-blue-200 group"
              >
                {/* Company Icon & Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {interview.company.charAt(0)}
                  </div>
                  <div className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                    {interview.interviewType}
                  </div>
                </div>

                {/* Company & Role */}
                <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  {interview.company}
                </h2>
                <p className="text-gray-600 mb-1 flex items-center gap-2">
                  <span className="text-lg">💼</span>
                  <span className="font-medium">{interview.role}</span>
                </p>

                {/* Tech Stack (if available) */}
                {interview.techStack && (
                  <p className="text-sm text-gray-500 mb-3 flex items-center gap-2">
                    <span>⚙️</span>
                    <span>{interview.techStack}</span>
                  </p>
                )}

                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 pt-3 border-t border-gray-100">
                  <span>📅</span>
                  <span>
                    {new Date(
                      interview.createdAt
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {/* View Button */}
                <button
                  className="w-full py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md hover:shadow-lg font-semibold group-hover:scale-105 transform"
                  onClick={() =>
                    navigate(`/summary/${interview._id}`)
                  }
                >
                  View Summary →
                </button>
              </div>
            ))}
          </div>
        )}

        {/* New Interview Button (when interviews exist) */}
        {interviews.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={() => navigate("/home")}
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl font-semibold text-lg"
            >
              + Start New Interview
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;