import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth";
import scoreRoutes from "./routes/scores";
import charactersRoutes from "./routes/characters";
import attackOrdersRoutes from "./routes/attackorders";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_, res) => res.json({ status: "ok" }));

app.use("/auth", authRoutes);
app.use("/scores", scoreRoutes);
app.use("/characters", charactersRoutes);
app.use("/attackorders", attackOrdersRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on ${PORT}`));
