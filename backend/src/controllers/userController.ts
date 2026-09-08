import { NextFunction, Request, Response } from "express";
import { userService } from "../services/userService.js";
import { userInputSchema } from "../schemas/userSchema.js";

export const userController = {
  getAll(_req: Request, res: Response, next: NextFunction): void {
    try {
      const users = userService.getAll();
      res.status(200).json({ success: true, data: users, meta: { count: users.length } });
    } catch (err) {
      next(err);
    }
  },

  getById(req: Request, res: Response, next: NextFunction): void {
    try {
      const user = userService.getById(req.params.id as string);
      res.status(200).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },

  create(req: Request, res: Response, next: NextFunction): void {
    try {
      const input = userInputSchema.parse(req.body);
      const user = userService.create(input);
      res.status(201).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },

  update(req: Request, res: Response, next: NextFunction): void {
    try {
      const input = userInputSchema.parse(req.body);
      const user = userService.update(req.params.id as string, input);
      res.status(200).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },

  delete(req: Request, res: Response, next: NextFunction): void {
    try {
      userService.delete(req.params.id as string);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
