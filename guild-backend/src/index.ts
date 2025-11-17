import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.ts";
import scoreRoutes from "./routes/scores.ts";
import charactersRoutes from "./routes/characters.ts";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_, res) => res.json({ status: "ok" }));

app.use("/auth", authRoutes);
app.use("/scores", scoreRoutes);
app.use("/characters", charactersRoutes);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend running → http://localhost:${PORT}`);
});
