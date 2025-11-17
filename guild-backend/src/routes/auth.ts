import { Router } from "express";
import { supabase } from "../supabase";
import jwt from "jsonwebtoken";
import { sendOtpToDiscord } from "../services/discord-otp";

const router = Router();

// Request OTP
router.post("/request-otp", async (req, res) => {
  const { character } = req.body;

  if (!character)
    return res.status(400).json({ error: "Missing character" });

  try {
    // Query Discord ID จาก tbl_guildmember
    const { data: charData, error: charError } = await supabase
      .from("tbl_guildmember")
      .select("discord_id")
      .eq("name", character)
      .single();

    if (charError || !charData) {
      console.error("[Request OTP] Character not found or query error");
      return res.status(404).json({ error: "Character not found" });
    }

    const discordId = charData.discord_id;

    // Clean-up OTP หมดอายุอัตโนมัติ
    await supabase
      .from("otp_codes")
      .delete()
      .lt("expires_at", new Date());

    // ตรวจสอบ OTP ล่าสุดของ character สำหรับ rate limit 8 ชั่วโมง
    const { data: lastOtpData, error: lastOtpError } = await supabase
      .from("otp_codes")
      .select("created_at")
      .eq("character", character)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastOtpError) {
      console.error("[Request OTP] Failed to check last OTP", lastOtpError);
      return res.status(500).json({ error: "Failed to check OTP history" });
    }

    if (lastOtpData) {
      const lastRequestTime = new Date(lastOtpData.created_at);
      const now = new Date();
      const diffHours = (now.getTime() - lastRequestTime.getTime()) / (1000 * 60 * 60);
      if (diffHours < 8) {
        return res.status(429).json({
          error: "You can request OTP only once every 8 hours",
          retry_after_hours: +(8 - diffHours).toFixed(2)
        });
      }
    }

    // ส่ง OTP ผ่าน Discord Bot และรับ OTP จริงกลับมา
    const otp = await sendOtpToDiscord(discordId);

    const expires_at = new Date(Date.now() + 60 * 60 * 1000); // OTP หมดอายุ 1 ชั่วโมง

    // บันทึก OTP จริงลง Supabase
    const { error } = await supabase.from("otp_codes").insert({
      discord_id: discordId,
      character,
      otp,
      created_at: new Date(),
      expires_at,
    });

    if (error) {
      console.error("[Request OTP] Failed to insert OTP into DB");
      return res.status(500).json({ error: "Failed to insert OTP" });
    }

    console.log("[Request OTP] OTP successfully sent and recorded");
    return res.json({ status: "otp_sent" });
  } catch (err) {
    console.error("[Request OTP] Internal server error", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  const { character, otp } = req.body;

  if (!character || !otp)
    return res.status(400).json({ error: "Missing character or OTP" });

  try {
    const { data, error } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("character", character)
      .eq("otp", otp)
      .maybeSingle();

    if (error) {
      console.error("[Verify OTP] Failed to query OTP");
      return res.status(500).json({ error: "Failed to query OTP" });
    }

    if (!data) return res.status(400).json({ error: "Invalid OTP" });

    if (new Date(data.expires_at) < new Date())
      return res.status(400).json({ error: "OTP expired" });

    // ลบ OTP ใช้แล้ว
    await supabase.from("otp_codes").delete().eq("character", character).eq("otp", otp);

    // Query guildmember_id
    const { data: gmData, error: gmError } = await supabase
      .from("tbl_guildmember")
      .select("id")
      .eq("name", character)
      .single();

    if (gmError || !gmData)
      return res.status(500).json({ error: "Failed to get guildmember_id" });

    const guildmember_id = gmData.id;

    const token = jwt.sign(
      { character, guildmember_id },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" }
    );

    return res.json({ token });
  } catch (err) {
    console.error("[Verify OTP] Internal server error", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
