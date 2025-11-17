import expressPkg from "express"; // สำหรับ runtime ใช้ expressPkg
import type { Request, Response, NextFunction } from "express"; // สำหรับ type
import jwt from "jsonwebtoken";

export type AuthRequest = Request & {
  user?: {
    character: string;
    guildmember_id: number;
  };
};

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Missing token" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      character: string;
      guildmember_id: number;
    };
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
