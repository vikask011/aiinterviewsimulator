import { useState, useRef, useEffect } from "react";
import { User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
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

  return (
    <nav className="flex justify-between items-center px-6 py-4 shadow-md bg-white">
      <h1
        className="text-xl font-bold text-gray-800 cursor-pointer"
        onClick={() => navigate("/home")}
      >
        AI Interview
      </h1>

      <div className="flex gap-6 items-center">
        <button
          onClick={() => navigate("/home")}
          className="font-medium text-gray-700 hover:text-blue-600 transition"
        >
          Home
        </button>

        {/* PROFILE DROPDOWN */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 focus:outline-none"
          >
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.name
              )}&background=3b82f6&color=fff&size=128`}
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-blue-500 transition cursor-pointer"
            />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-200">
                <p className="font-semibold text-gray-800">
                  {user.name}
                </p>
                <p className="text-sm text-gray-500">
                  {user.email}
                </p>
              </div>

              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate("/profile");
                }}
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition w-full text-left"
              >
                <User size={18} className="text-gray-600" />
                <span className="text-gray-700">Profile</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition w-full text-left border-t border-gray-200 mt-1"
              >
                <LogOut size={18} className="text-red-600" />
                <span className="text-red-600">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
