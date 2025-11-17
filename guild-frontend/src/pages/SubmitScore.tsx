import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const BOSSES = [
  { id: 1, name: "Boss แทโอ" },
  { id: 2, name: "Boss ไคล์" },
  { id: 3, name: "Boss คาร์ม่า" },
  { id: 4, name: "Boss ยอนฮี" },
  { id: 5, name: "Boss น่องไก่" },
];

export default function SubmitScore() {
  const navigate = useNavigate();
  const [selectedBoss, setSelectedBoss] = useState<number | null>(null);
  const [score, setScore] = useState("");
  const [runs, setRuns] = useState("");
  const [mode, setMode] = useState<"add" | "overwrite">("add");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [character, setCharacter] = useState<string | null>(null);

  useEffect(() => {
    const tokenCharacter = localStorage.getItem("character");
    if (tokenCharacter) setCharacter(tokenCharacter);
  }, []);

  const submit = async () => {
    const token = localStorage.getItem("token");
    if (!token) return setMessage("กรุณาล็อกอินก่อน");
    if (!selectedBoss) return setMessage("กรุณาเลือกบอส");
    if (!score) return setMessage("กรุณากรอกคะแนน");

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/scores/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            boss_id: selectedBoss,
            score: Number(score),
            runs: runs ? Number(runs) : 1,
            mode, // add หรือ overwrite
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) setMessage(data.error || "เกิดข้อผิดพลาด");
      else {
        setMessage("บันทึกคะแนนเรียบร้อย!");
        setScore("");
        setRuns("");
      }
    } catch {
      setMessage("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }

    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("character");
    setCharacter(null);
    navigate("/login");
  };

  return (
    <>
      <Navbar character={character} onLogout={handleLogout} />

      <div className="min-h-screen flex flex-col items-center justify-start pt-12 bg-gray-100">
        <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Submit Score</h2>

          {/* เลือกบอส */}
          <p className="mb-2 font-medium text-gray-700">เลือกบอส</p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {BOSSES.map((boss) => (
              <button
                key={boss.id}
                onClick={() => setSelectedBoss(boss.id)}
                className={`py-2 rounded-lg font-semibold text-white transition-colors ${
                  selectedBoss === boss.id
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-400 hover:bg-gray-500"
                }`}
              >
                {boss.name}
              </button>
            ))}
          </div>

          {/* ใส่คะแนน */}
          <input
            type="number"
            placeholder="คะแนน"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="w-full p-3 mb-4 border rounded-lg"
          />

          {/* ใส่รอบ */}
          <input
            type="number"
            placeholder="รอบตีที่ใช้ (ถ้าไม่กรอกจะถือว่าเป็น 1)"
            value={runs}
            onChange={(e) => setRuns(e.target.value)}
            className="w-full p-3 mb-4 border rounded-lg"
          />

          {/* เลือกโหมด add หรือ overwrite */}
          <p className="mb-2 font-medium text-gray-700">โหมดการบันทึก</p>
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="mode"
                value="add"
                checked={mode === "add"}
                onChange={() => setMode("add")}
              />
              บวกคะแนนจากของเดิม
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="mode"
                value="overwrite"
                checked={mode === "overwrite"}
                onChange={() => setMode("overwrite")}
              />
              กรอกคะแนนทั้งหมด
            </label>
          </div>

          {/* ปุ่ม submit */}
          <button
            onClick={submit}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold mb-4"
          >
            {loading ? "กำลังบันทึก..." : "Submit"}
          </button>

          {message && (
            <p className="text-center mt-4 text-red-500 font-semibold">{message}</p>
          )}
        </div>
      </div>
    </>
  );
}
