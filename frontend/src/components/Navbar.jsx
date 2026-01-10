import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center px-6 py-4 shadow-md">
      <h1 className="text-xl font-bold">AI Interview</h1>

      <div className="flex gap-4">
        <Link to="/home" className="font-medium">
          Home
        </Link>
        <Link to="/profile" className="font-medium">
          Profile
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
