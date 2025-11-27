import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const BOSSES = [
  { id: 1, name: "Boss แทโอ", img: "/assets/Teo.PNG" },
  { id: 2, name: "Boss ไคล์", img: "/assets/Kyle.PNG" },
  { id: 3, name: "Boss คาร์ม่า", img: "/assets/Karma.PNG" },
  { id: 4, name: "Boss ยอนฮี", img: "/assets/Yeonhee.PNG" },
  { id: 5, name: "Boss น่องไก่", img: "/assets/Chicken.PNG" },
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

    const scoreNum = Number(score);
    const runsNum = runs ? Number(runs) : 1;

    // Validation
    if (isNaN(scoreNum)) return setMessage("กรุณากรอกคะแนนเป็นตัวเลข");
    if (scoreNum < 0) return setMessage("คะแนนต้องไม่น้อยกว่า 0");

    if (isNaN(runsNum)) return setMessage("กรุณากรอกรอบตีเป็นตัวเลข");
    if (runsNum < 1) return setMessage("รอบตีต้องไม่น้อยกว่า 1");
    if (runsNum > 13) return setMessage("รอบตีต้องไม่เกิน 13");

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/scores/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          boss_id: selectedBoss,
          score: scoreNum,
          runs: runsNum,
          mode,
        }),
      });

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

      <div className="min-h-screen flex flex-col items-center bg-gray-100 py-8 px-4">
        <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Advent Expedition Score Report
          </h2>

          {/* เลือกบอส */}
          <p className="mb-2 font-medium text-gray-700">เลือกบอส</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            {BOSSES.map((boss) => (
              <div
                key={boss.id}
                onClick={() => setSelectedBoss(boss.id)}
                className={`cursor-pointer rounded-xl overflow-hidden shadow-md border bg-white transition ${
                  selectedBoss === boss.id
                    ? "ring-2 ring-green-500 opacity-100"
                    : "opacity-70"
                }`}
              >
                <img
                  src={boss.img}
                  alt={boss.name}
                  className={`w-full h-28 object-cover transition ${
                    selectedBoss === boss.id ? "grayscale-0" : "grayscale"
                  }`}
                />

                <p className="text-center font-semibold py-2 text-sm bg-gray-50">
                  {boss.name}
                </p>
              </div>
            ))}
          </div>

          {/* ใส่คะแนน */}
          <input
            type="number"
            placeholder="คะแนน"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            min={0}
            max={6000000}
            className="w-full p-3 mb-4 border rounded-lg"
          />

          {/* ใส่รอบ */}
          <input
            type="number"
            placeholder="รอบตีที่ใช้ (1-13 | ถ้าไม่กรอกถือว่าเป็น 1)"
            value={runs}
            onChange={(e) => setRuns(e.target.value)}
            min={1}
            max={13}
            className="w-full p-3 mb-4 border rounded-lg"
          />

          {/* โหมดบันทึก */}
          <p className="mb-2 font-medium text-gray-700">โหมดการบันทึก</p>
          <div className="flex flex-col gap-2 mb-6">
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

          {/* submit */}
          <button
            onClick={submit}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold transition"
          >
            {loading ? "กำลังบันทึก..." : "Submit"}
          </button>

          {message && (
            <p className="text-center mt-4 text-red-500 font-semibold">
              {message}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
