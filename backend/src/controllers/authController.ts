import { NextFunction, Request, Response } from "express";
import { authService } from "../services/authService.js";
import { loginSchema, registerSchema } from "../schemas/authSchema.js";

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try { res.status(201).json({ success: true, data: await authService.register(registerSchema.parse(req.body)) }); } catch (err) { next(err); }
  },
  async login(req: Request, res: Response, next: NextFunction) {
    try { res.status(200).json({ success: true, data: await authService.login(loginSchema.parse(req.body)) }); } catch (err) { next(err); }
  },
  async me(req: Request, res: Response, next: NextFunction) {
    try { res.status(200).json({ success: true, data: await authService.me(req.userId!) }); } catch (err) { next(err); }
  },
};
