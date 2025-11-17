import { Router } from "express";
import { supabase } from "../supabase";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("tbl_guildmember")
      .select("name");

    if (error) return res.status(500).json({ error: error.message });

    return res.json({ characters: data.map((c: any) => c.name) });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
