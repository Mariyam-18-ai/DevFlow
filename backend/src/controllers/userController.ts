import { NextFunction, Request, Response } from "express";
import { userService } from "../services/userService.js";
import { userInputSchema } from "../schemas/userSchema.js";

export const userController = {
  async getAll(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const users = await userService.getAll();
      res.status(200).json({
        success: true,
        data: users,
        meta: { count: users.length },
      });
    } catch (err) {
      next(err);
    }
  },

  async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await userService.getById(
        String(req.params.id)
      );
      res.status(200).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },

  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const input = userInputSchema.parse(req.body);
      const user = await userService.create(input);
      res.status(201).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },

  async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const input = userInputSchema.parse(req.body);
      const user = await userService.update(
        String(req.params.id),
        input
      );
      res.status(200).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },

  async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await userService.delete(String(req.params.id));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
