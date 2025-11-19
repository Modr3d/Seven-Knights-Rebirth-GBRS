import { useState } from "react";
import { NavLink } from "react-router-dom";

interface NavbarProps {
  character: string | null;
  onLogout: () => void;
}

export default function Navbar({ character, onLogout }: NavbarProps) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full bg-gray-800 text-white">
      <div className="flex justify-between items-center px-4 md:px-8 py-4 w-full">
        {/* Logo */}
        <div className="font-bold text-xl">RoyalBreaker</div>

        {/* Hamburger (มือถือ) */}
        <button className="md:hidden text-2xl" onClick={() => setOpen(!open)}>
          ☰
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
              แจ้งคะแนนบอส
            </NavLink>

            <NavLink
              to="/scores"
              className={({ isActive }) =>
                `px-3 py-1 rounded ${
                  isActive ? "bg-green-600" : "hover:bg-gray-700"
                }`
              }
            >
              เช็คคะแนนรวม
            </NavLink>

            <NavLink
              to="/attackorder"
              className={({ isActive }) =>
                `px-3 py-1 rounded ${
                  isActive ? "bg-green-600" : "hover:bg-gray-700"
                }`
              }
            >
              ลำดับการตีบอส
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
        <div className="md:hidden mt-2 space-y-2 bg-gray-700 p-4 rounded-b-lg">
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
