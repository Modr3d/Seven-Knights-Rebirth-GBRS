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

interface ScoreRecord {
  character: string;
  boss_id: number;
  score: number;
  runs: number;
}

export default function ViewScores() {
  const navigate = useNavigate();
  const [scores, setScores] = useState<ScoreRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [character, setCharacter] = useState<string | null>(null);

  const [selectedBoss, setSelectedBoss] = useState<number | null>(null);

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

  const characters = Array.from(new Set(scores.map((s) => s.character)));

  const filteredBosses = selectedBoss
    ? BOSSES.filter((b) => b.id === selectedBoss)
    : BOSSES;

  // Export CSV
  const handleExportCSV = () => {
    // Header CSV: ใส่ Character + score/runs ของแต่ละบอส + Total + Runs
    const header = ["Character"];
    filteredBosses.forEach((b) => {
      header.push(`${b.name}_score`);
      header.push(`${b.name}_runs`);
    });
    header.push("Total_Score", "Runs_Used", "Runs_Left");

    const rows: string[] = [];

    characters.forEach((char) => {
      const records = scores.filter((s) => s.character === char);
      const row: any[] = [char];

      filteredBosses.forEach((boss) => {
        const record = records.find((r) => r.boss_id === boss.id);
        row.push(record ? record.score : 0);
        row.push(record ? record.runs : 0);
      });

      const totalScore = records.reduce((sum, r) => sum + r.score, 0);
      const totalRuns = records.reduce((sum, r) => sum + r.runs, 0);
      const runsLeft = Math.max(0, 14 - totalRuns);

      row.push(totalScore, totalRuns, runsLeft);
      rows.push(row.join(","));
    });

    // รวม Header + Rows
    const csvContent = [header.join(","), ...rows].join("\n");

    // สร้างไฟล์ CSV พร้อมดาวน์โหลดชื่อไฟล์ชัดเจน
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "scores_for_ai.csv"; // <- ชื่อไฟล์ชัดเจน
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Navbar character={character} onLogout={handleLogout} />

      <div className="min-h-screen flex flex-col items-center pt-12 bg-gray-100">
        <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-4xl">
          <h2 className="text-2xl font-bold mb-6 text-center">
            ผลสรุปคะแนนของซีซั่นปัจจุบัน
          </h2>

          {/* NEW: ปุ่ม Export CSV */}
          <div className="flex justify-end mb-4">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow"
            >
              Export CSV
            </button>
          </div>

          <div className="w-full overflow-x-auto mb-8">
            <div className="grid grid-cols-5 gap-4 min-w-[650px]">
              {BOSSES.map((boss) => (
                <div
                  key={boss.id}
                  onClick={() =>
                    setSelectedBoss(selectedBoss === boss.id ? null : boss.id)
                  }
                  className={`cursor-pointer rounded-xl overflow-hidden shadow-md border bg-white transition ${
                    selectedBoss === boss.id
                      ? "ring-2 ring-purple-600 opacity-100"
                      : "opacity-70"
                  }`}
                >
                  <img
                    src={boss.img}
                    alt={boss.name}
                    className={`w-full h-24 object-cover transition ${
                      selectedBoss === boss.id ? "grayscale-0" : "grayscale"
                    }`}
                  />
                  <p className="text-center font-semibold py-2 text-sm bg-gray-50">
                    {boss.name}
                  </p>
                </div>
              ))}
            </div>
          </div>

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

                    {filteredBosses.map((boss) => (
                      <th key={boss.id} className="py-2 px-4 border">
                        {boss.name}
                      </th>
                    ))}

                    <th className="py-2 px-4 border">คะแนนรวม</th>
                    <th className="py-2 px-4 border w-40">รอบตี (ใช้/เหลือ)</th>
                  </tr>
                </thead>

                <tbody>
                  {characters.map((char) => {
                    const records = scores.filter((s) => s.character === char);

                    const totalScore = records.reduce(
                      (sum, r) => sum + r.score,
                      0
                    );

                    const totalRuns = records.reduce(
                      (sum, r) => sum + r.runs,
                      0
                    );

                    const remainingRuns = Math.max(0, 14 - totalRuns);

                    return (
                      <tr key={char} className="text-center">
                        <td className="py-2 px-4 border font-bold">{char}</td>

                        {filteredBosses.map((boss) => {
                          const record = records.find(
                            (r) => r.boss_id === boss.id
                          );
                          return (
                            <td key={boss.id} className="py-2 px-4 border">
                              {record
                                ? `${record.score} (${record.runs} ไม้)`
                                : "-"}
                            </td>
                          );
                        })}

                        <td className="py-2 px-4 border font-semibold text-blue-700">
                          {totalScore}
                        </td>

                        <td className="py-2 px-4 border font-semibold text-green-700">
                          {totalRuns} / {remainingRuns}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
