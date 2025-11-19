import { Router } from "express";
import { supabase } from "../supabase";
import { authMiddleware } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";

const router = Router();

// Map boss_id → boss_name
const BOSS_NAMES: Record<number, string> = {
  1: "แทโอ",
  2: "ไคล์",
  3: "คาร์ม่า",
  4: "ยอนฮี",
};

// GET Attack Orders per member (with boss names)
router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const seasonNumberQuery = req.query.season_number as string | undefined;

    // หา season_number
    const seasonQuery = seasonNumberQuery
      ? supabase.from("seasons").select("season_number").eq("season_number", seasonNumberQuery).single()
      : supabase.from("seasons").select("season_number").eq("is_active", true).single();

    const { data: seasonData, error: seasonError } = await seasonQuery;
    if (seasonError || !seasonData) return res.status(404).json({ error: "Season not found" });

    const season_number = seasonData.season_number;

    // ดึง attack orders พร้อมชื่อสมาชิก
    const { data: ordersData, error: ordersError } = await supabase
      .from("boss_attack_orders")
      .select(`
        member_id,
        tbl_guildmember(name),
        boss_id,
        attack_order
      `)
      .eq("season_number", season_number)
      .order("member_id", { ascending: true })
      .order("attack_order", { ascending: true });

    if (ordersError) return res.status(500).json({ error: "Failed to fetch attack orders" });

    // Group by member_name และ map boss_id → boss_name ตาม attack_order
    const grouped: Record<string, string[]> = {};
    (ordersData || []).forEach((o: any) => {
      const name = o.tbl_guildmember.name;
      if (!grouped[name]) grouped[name] = [];
      grouped[name].push(BOSS_NAMES[o.boss_id] || `Unknown(${o.boss_id})`);
    });

    // แปลงเป็น array ของ object
    const result = Object.entries(grouped).map(([member_name, boss_order]) => ({
      member_name,
      boss_order,
    }));

    res.json({ memberAttacks: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
