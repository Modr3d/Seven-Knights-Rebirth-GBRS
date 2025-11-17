import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import SubmitScore from "../pages/SubmitScore";
import ViewScores from "../pages/ViewScores";
import PrivateRoute from "./PrivateRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* หน้า Login */}
      <Route path="/login" element={<Login />} />

      {/* หน้า SubmitScore (Private) */}
      <Route
        path="/submit"
        element={
          <PrivateRoute>
            <SubmitScore />
          </PrivateRoute>
        }
      />

      {/* หน้า ViewScores (Private) */}
      <Route
        path="/scores"
        element={
          <PrivateRoute>
            <ViewScores />
          </PrivateRoute>
        }
      />

      {/* Fallback สำหรับ path อื่น */}
      <Route
        path="*"
        element={
          localStorage.getItem("token") ? (
            <Navigate to="/submit" />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
}
