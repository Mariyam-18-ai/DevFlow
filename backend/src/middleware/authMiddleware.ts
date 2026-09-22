import { NextFunction, Request, Response } from "express";
import { AppError } from "../types/index.js";
import { verifyToken } from "../services/authService.js";

declare global {
  namespace Express { interface Request { userId?: string } }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : "";
  const userId = verifyToken(token);
  if (!userId) return next(new AppError("Authentication required.", 401, "UNAUTHENTICATED"));
  req.userId = userId;
  next();
}
