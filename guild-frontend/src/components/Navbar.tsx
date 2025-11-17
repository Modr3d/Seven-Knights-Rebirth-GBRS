import { NavLink } from "react-router-dom";

interface NavbarProps {
  character: string | null;
  onLogout: () => void;
}

export default function Navbar({ character, onLogout }: NavbarProps) {
  return (
    <nav className="w-full bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="font-bold text-xl">RoyalBreaker</div>
      {character && (
        <div className="flex items-center space-x-4">
          <NavLink
            to="/submit"
            className={({ isActive }) =>
              `px-3 py-1 rounded ${
                isActive ? "bg-green-600" : "hover:bg-gray-700"
              }`
            }
          >
            Submit Score
          </NavLink>
          <NavLink
            to="/scores"
            className={({ isActive }) =>
              `px-3 py-1 rounded ${
                isActive ? "bg-green-600" : "hover:bg-gray-700"
              }`
            }
          >
            View Scores
          </NavLink>
          <span>Hi, {character}</span>
          <button
            onClick={onLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
