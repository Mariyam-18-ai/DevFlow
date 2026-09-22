import { NextFunction, Request, Response } from "express";
import { userService } from "../services/userService.js";
import { AppError } from "../types/index.js";
import { userInputSchema } from "../schemas/userSchema.js";

export const userController = {
  async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const users = await userService.getAll();
      if (req.userId) users.sort((a, b) => Number(b.id === req.userId) - Number(a.id === req.userId));
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
      const requestedUserId = String(req.params.id);

      // A normal authenticated user may only delete their own account.
      // This prevents an authenticated client from deleting another member
      // simply by changing the user id in the request URL.
      if (req.userId !== requestedUserId) {
        throw new AppError(
          "You can only delete your own account.",
          403,
          "FORBIDDEN"
        );
      }

      await userService.delete(requestedUserId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
