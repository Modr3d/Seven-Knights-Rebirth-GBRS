import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface LoginResponse {
  token?: string;
  error?: string;
}

export default function Login() {
  const [character, setCharacter] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [characters, setCharacters] = useState<string[]>([]);
  const navigate = useNavigate(); // <-- เพิ่มตรงนี้

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${API_URL}/characters`)
      .then((res) => res.json())
      .then((data) => setCharacters(data.characters || []))
      .catch(() => setCharacters([]));
  }, []);

  const requestOtp = async () => {
    if (!character) return setMessage("กรุณาเลือกตัวละคร");
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ character }),
      });
      const data = await res.json();
      if (!res.ok) setMessage(data.error || "เกิดข้อผิดพลาด");
      else setMessage("ส่ง OTP ไปยัง Discord ของคุณแล้ว");
    } catch {
      setMessage("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    if (!otp) return setMessage("กรุณากรอก OTP");
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ character, otp }),
      });
      const data: LoginResponse = await res.json();

      if (!res.ok) setMessage(data.error || "เกิดข้อผิดพลาด");
      else if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("character", character);
        setMessage("ล็อกอินสำเร็จ!");

        navigate("/submit"); // <-- redirect หลัง login
      }
    } catch {
      setMessage("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Guild Login</h2>

        {/* Character Select */}
        <label className="block mb-2 font-medium text-gray-700">
          เลือกตัวละคร
        </label>
        <select
          value={character}
          onChange={(e) => setCharacter(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg"
        >
          <option value="">-- เลือกตัวละคร --</option>
          {characters.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <button
          onClick={requestOtp}
          disabled={loading || !character}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg mb-4 font-semibold"
        >
          {loading ? "กำลังส่ง OTP..." : "ขอ OTP"}
        </button>

        {/* OTP Input */}
        <label className="block mb-2 font-medium text-gray-700">
          รหัส OTP จาก Discord
        </label>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full p-3 border mb-4 border-gray-300 rounded-lg"
          placeholder="กรอกรหัส 6 หลัก"
        />

        <button
          onClick={handleLogin}
          disabled={loading || !otp}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold"
        >
          {loading ? "กำลังตรวจสอบ..." : "ล็อกอิน"}
        </button>

        {message && (
          <p className="text-center mt-4 text-red-500 font-semibold">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
