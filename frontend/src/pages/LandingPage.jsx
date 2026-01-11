import React from "react";
import { Link } from "react-router-dom";
import { Mic, Video, BarChart3, Settings2, PlayCircle } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* --- HERO SECTION --- */}
      <header className="max-w-7xl mx-auto px-8 pt-24 pb-32 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-bold tracking-wide uppercase">
            Now Powered by Sarvam.ai
          </span>
          <h1 className="mt-6 text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight">
            Master your next <span className="text-blue-600">Big Interview.</span>
          </h1>
          <p className="mt-6 text-xl text-slate-600 leading-relaxed max-w-lg">
            Practice with our ultra-realistic AI interviewer. Get instant feedback on your technical skills, body language, and speech clarity.
          </p>
          <div className="mt-10 flex space-x-4">
            {/* Main CTA linked to /landing */}
            <Link to="/startpractice" className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition shadow-2xl shadow-blue-200">
              Start Practice Session
            </Link>
            
          </div>
        </div>

        <div className="relative">
          {/* Mockup of the Interview UI */}
          <Link to="/landing" className="block group">
            <div className="bg-white rounded-3xl shadow-2xl p-4 border border-slate-200 transform lg:rotate-2 group-hover:rotate-0 transition-transform duration-500">
               <div className="aspect-video bg-slate-900 rounded-2xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 flex space-x-2">
                     <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"><Video size={16} className="text-white"/></div>
                     <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"><Mic size={16} className="text-white"/></div>
                  </div>
                  <div className="text-center p-6 z-10">
                     <p className="text-blue-400 font-mono text-sm mb-2">Interviewer is listening...</p>
                     <p className="text-white text-lg font-medium">"How do you handle state management in large scale React apps?"</p>
                  </div>
               </div>
               <div className="mt-4 flex items-center justify-between px-2">
                  <div className="flex space-x-1">
                     {[1,2,3,4,5].map(i => <div key={i} className={`h-1.5 w-8 rounded-full ${i <= 3 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>)}
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Question 3 of 5</span>
               </div>
            </div>
          </Link>
        </div>
      </header>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold">Everything you need to succeed</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Settings2 className="text-blue-600" size={32}/>}
              title="Full Customization"
              desc="Set your role, tech stack, and experience level. The AI adapts its difficulty to match your real-world scenarios."
            />
            <FeatureCard 
              icon={<Video className="text-indigo-600" size={32}/>}
              title="Video & Audio Analysis"
              desc="Record your sessions. Our AI analyzes your facial expressions and tone to ensure you project confidence."
            />
            <FeatureCard 
              icon={<BarChart3 className="text-emerald-600" size={32}/>}
              title="Instant Summary"
              desc="No waiting. Get a detailed report of your strengths, weaknesses, and improvement areas immediately after the session."
            />
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section id="how-it-works" className="py-24 max-w-5xl mx-auto px-8 border-t">
        <h2 className="text-center text-3xl font-bold mb-16">Practice makes perfect</h2>
        <div className="space-y-12">
          <Step num="01" title="Configure your session" desc="Tell us the company and role you are interviewing for." />
          <Step num="02" title="Face the AI Interviewer" desc="Answer verbal questions. Your video and audio are processed in real-time." />
          <Step num="03" title="Review Performance" desc="Check your AI-generated score and deep-dive into suggested improvements." />
        </div>
        <div className="mt-20 text-center">
             <Link to="/startpractice" className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-bold text-xl hover:scale-105 transition-transform shadow-xl">
                Ready? Start Practicing Now
             </Link>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-8 text-center">
        <p>2026 INTERVIEW.AI • Built for the next generation of talent.</p>
      </footer>
    </div>
  );
};

/* Helper Components */
const FeatureCard = ({ icon, title, desc }) => (
  <div className="p-8 rounded-3xl border border-slate-100 bg-slate-50 hover:shadow-xl transition-shadow">
    <div className="mb-6">{icon}</div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{desc}</p>
  </div>
);

const Step = ({ num, title, desc }) => (
  <div className="flex items-start space-x-6">
    <span className="text-5xl font-black text-slate-200">{num}</span>
    <div>
      <h4 className="text-xl font-bold mb-1">{title}</h4>
      <p className="text-slate-600">{desc}</p>
    </div>
  </div>
);

export default LandingPage;