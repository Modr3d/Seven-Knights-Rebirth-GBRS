import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

interface MemberAttack {
  member_name: string;
  boss_order: string[];
}

export default function AttackOrderPage() {
  const [memberAttacks, setMemberAttacks] = useState<MemberAttack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const url = `${import.meta.env.VITE_API_URL}/attackorders`;

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to fetch data");
        }

        const data = await res.json();
        setMemberAttacks(data.memberAttacks || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <Navbar
        character={localStorage.getItem("character")}
        onLogout={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("character");
          window.location.href = "/login";
        }}
      />

      <div className="min-h-screen flex flex-col items-center pt-12 bg-gray-100">
        <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-2xl">
          <h2 className="text-2xl font-bold mb-6 text-center">Boss Order (อยู่ระหว่างการพัฒนา ผิดพลาดขออภัย)</h2>

          {loading && <p className="text-center">กำลังโหลด...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}

          {memberAttacks.length > 0 && (
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-2 px-4 border">ชื่อสมาชิก</th>
                  <th className="py-2 px-4 border">ลำดับความสำคัญในการตี</th>
                </tr>
              </thead>
              <tbody>
                {memberAttacks.map((m, idx) => (
                  <tr key={idx} className="text-center">
                    <td className="py-2 px-4 border font-semibold">{m.member_name}</td>
                    <td className="py-2 px-4 border">{m.boss_order.join(" -> ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
