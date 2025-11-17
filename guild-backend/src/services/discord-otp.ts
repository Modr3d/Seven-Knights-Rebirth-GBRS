import { Client, GatewayIntentBits } from "discord.js";

const bot = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent],
});

bot.login(process.env.DISCORD_BOT_TOKEN);

export async function sendOtpToDiscord(discordId: string) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const user = await bot.users.fetch(discordId);
  await user.send(`Your OTP: **${otp}**`);
  return otp;
}
