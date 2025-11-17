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

interface ScoreRecord {
  character: string;
  boss_id: number;
  boss_name: string;
  score: number;
  runs: number;
}

export default function ViewScores() {
  const navigate = useNavigate();
  const [scores, setScores] = useState<ScoreRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [character, setCharacter] = useState<string | null>(null);

  useEffect(() => {
    const tokenCharacter = localStorage.getItem("character");
    if (tokenCharacter) setCharacter(tokenCharacter);
  }, []);

  useEffect(() => {
    const fetchScores = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      setLoading(true);
      setMessage("");

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/scores/list`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 401) navigate("/login");
          else setMessage(data.error || "เกิดข้อผิดพลาด");
        } else {
          setScores(data);
        }
      } catch {
        setMessage("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
      }

      setLoading(false);
    };

    fetchScores();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("character");
    setCharacter(null);
    navigate("/login");
  };

  return (
    <>
      <Navbar character={character} onLogout={handleLogout} />

      <div className="min-h-screen flex flex-col items-center pt-12 bg-gray-100">
        <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-3xl">
          <h2 className="text-2xl font-bold mb-6 text-center">ผลสรุปคะแนนของซีซั่นปัจจุบัน</h2>

          {loading ? (
            <p className="text-center text-gray-600">กำลังโหลด...</p>
          ) : message ? (
            <p className="text-center text-red-500">{message}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="py-2 px-4 border">Character</th>
                    {BOSSES.map((boss) => (
                      <th key={boss.id} className="py-2 px-4 border">{boss.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from(new Set(scores.map(s => s.character))).map((char) => (
                    <tr key={char} className="text-center">
                      <td className="py-2 px-4 border">{char}</td>
                      {BOSSES.map((boss) => {
                        const record = scores.find(
                          (s) => s.character === char && s.boss_id === boss.id
                        );
                        return (
                          <td key={boss.id} className="py-2 px-4 border">
                            {record ? `${record.score} (${record.runs} ไม้)` : "-"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
