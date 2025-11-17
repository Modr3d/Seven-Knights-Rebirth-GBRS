import { useState } from "react";
import { NavLink } from "react-router-dom";

interface NavbarProps {
  character: string | null;
  onLogout: () => void;
}

export default function Navbar({ character, onLogout }: NavbarProps) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full bg-gray-800 text-white p-4">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        <div className="font-bold text-xl">RoyalBreaker</div>

        {/* Hamburger (มือถือ) */}
        <button
          className="md:hidden block"
          onClick={() => setOpen(!open)}
        >
          <span className="text-2xl">☰</span>
        </button>

        {/* เมนูปกติ (Desktop) */}
        {character && (
          <div className="hidden md:flex items-center space-x-4">
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
      </div>

      {/* เมนูมือถือ (Mobile Dropdown) */}
      {character && open && (
        <div className="md:hidden mt-4 space-y-2 bg-gray-700 p-4 rounded-lg">
          <NavLink
            to="/submit"
            className={({ isActive }) =>
              `block px-3 py-2 rounded ${
                isActive ? "bg-green-600" : "hover:bg-gray-600"
              }`
            }
            onClick={() => setOpen(false)}
          >
            Submit Score
          </NavLink>

          <NavLink
            to="/scores"
            className={({ isActive }) =>
              `block px-3 py-2 rounded ${
                isActive ? "bg-green-600" : "hover:bg-gray-600"
              }`
            }
            onClick={() => setOpen(false)}
          >
            View Scores
          </NavLink>

          <div className="text-white">Hi, {character}</div>

          <button
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="w-full bg-red-500 hover:bg-red-600 px-3 py-2 rounded text-left"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
