console.log("[scores.ts] loaded");

import { Router } from "express";
import { supabase } from "../supabase";
import { authMiddleware } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";

const router = Router();

// SUBMIT SCORE
router.post("/submit", authMiddleware, async (req: AuthRequest, res) => {
  const { guildmember_id } = req.user!;
  const { boss_id, score, runs, mode } = req.body; // mode: "add" | "overwrite"

  if (!boss_id || !score)
    return res.status(400).json({ error: "Missing boss_id or score" });

  try {
    const { data: seasonData, error: seasonError } = await supabase
      .from("seasons")
      .select("season_number")
      .eq("is_active", true)
      .single();

    const season = seasonData?.season_number ?? 1;

    // ตรวจสอบว่า record เดิมมีไหม
    const { data: existing, error: existingError } = await supabase
      .from("boss_scores")
      .select("*")
      .eq("guildmember_id", guildmember_id)
      .eq("boss_id", boss_id)
      .eq("season", season)
      .single();

    if (existingError && existingError.code !== "PGRST116") { // PGRST116 = not found
      console.error("[Submit Score] Fetch existing failed:", existingError);
      return res.status(500).json({ error: "Failed to check existing score" });
    }

    if (existing) {
      // ถ้ามี record แล้ว
      if (mode === "add") {
        // บวกคะแนน + รอบ
        const { error: updateError } = await supabase
          .from("boss_scores")
          .update({
            score: existing.score + score,
            runs: existing.runs + (runs ?? 1),
          })
          .eq("id", existing.id);

        if (updateError) {
          console.error("[Submit Score] Update failed:", updateError);
          return res.status(500).json({ error: "Failed to update score" });
        }
      } else {
        // overwrite
        const { error: updateError } = await supabase
          .from("boss_scores")
          .update({
            score,
            runs: runs ?? 1,
          })
          .eq("id", existing.id);

        if (updateError) {
          console.error("[Submit Score] Overwrite failed:", updateError);
          return res.status(500).json({ error: "Failed to overwrite score" });
        }
      }
    } else {
      // ถ้าไม่มี record ก็ insert ใหม่
      const { error: insertError } = await supabase.from("boss_scores").insert({
        guildmember_id,
        boss_id,
        score,
        runs: runs ?? 1,
        season,
      });

      if (insertError) {
        console.error("[Submit Score] Insert failed:", insertError);
        return res.status(500).json({ error: "Insert failed", details: insertError });
      }
    }

    return res.json({ status: "saved" });
  } catch (err) {
    console.error("[Submit Score] Failed", err);
    return res.status(500).json({ error: "Failed to submit score" });
  }
});


// GET LIST
router.get("/list", authMiddleware, async (req: AuthRequest, res) => {
  try {
    // ใช้ raw SQL query เพื่อ join tbl_guildmember
    const { data, error } = await supabase.rpc("get_scores_with_names");

    if (error) {
      console.error("[Get Scores] Failed:", error);
      return res.status(500).json({ error: "Failed to fetch scores" });
    }

    // map ให้ React ใช้ character ได้
    const formatted = (data as any[]).map((row) => ({
      character: row.name,
      boss_id: row.boss_id,
      score: row.score,
      runs: row.runs,
    }));

    return res.json(formatted);
  } catch (err) {
    console.error("[Get Scores] Failed", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
