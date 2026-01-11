import { useState, useRef, useEffect } from "react";
import { User, LogOut, Home, ChevronDown, Sparkles } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  /* =========================
      LOAD USER FROM LOCALSTORAGE
  ========================= */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  /* =========================
      CLOSE DROPDOWN ON OUTSIDE CLICK
  ========================= */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* =========================
      LOGOUT
  ========================= */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsProfileOpen(false);
    navigate("/login");
  };

  // ⛔ Hide navbar if user not logged in
  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
        
        {/* LEFT: LOGO */}
        <div 
          className="flex items-center gap-2 group cursor-pointer"
          onClick={() => navigate("/home")}
        >
          <div className="bg-blue-600 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
            <Sparkles className="text-white" size={18} />
          </div>
          <h1 className="text-xl font-black tracking-tight text-gray-900 uppercase">
            AI <span className="text-blue-600">Interview</span>
          </h1>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-8">
          {/* NAVIGATION LINKS */}
          <button
            onClick={() => navigate("/home")}
            className={`flex items-center gap-2 text-sm font-semibold transition-all duration-200 ${
              isActive("/home") 
                ? "text-blue-600 border-b-2 border-blue-600 py-1" 
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Home size={18} />
            Home
          </button>

          {/* PROFILE DROPDOWN */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 p-1 rounded-full border border-transparent hover:border-gray-200 hover:bg-gray-50 transition-all focus:outline-none"
            >
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff&size=100`}
                alt="Profile"
                className="w-8 h-8 rounded-full shadow-sm ring-2 ring-white"
              />
              <div className="hidden sm:block text-left mr-1">
                <p className="text-xs font-bold text-gray-800 leading-none">{user.name}</p>
              </div>
              <ChevronDown 
                size={14} 
                className={`text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} 
              />
            </button>

            {/* DROPDOWN MENU */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-60 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* USER INFO SECTION */}
                <div className="px-4 py-3 border-b border-gray-50 mb-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Signed in as</p>
                  <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
                </div>

                {/* LINKS */}
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate("/profile");
                  }}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition w-full text-left group"
                >
                  <div className="p-1.5 bg-gray-100 rounded-lg group-hover:bg-blue-100 group-hover:text-blue-600 transition">
                    <User size={16} />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">My Profile</span>
                </button>

                <div className="mx-2 my-1 border-t border-gray-50"></div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition w-full text-left group"
                >
                  <div className="p-1.5 bg-gray-100 rounded-lg group-hover:bg-red-100 group-hover:text-red-600 transition">
                    <LogOut size={16} />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-red-600">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;