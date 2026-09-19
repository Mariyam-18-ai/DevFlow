import { Request, Response, NextFunction } from "express";
import { userService } from "../services/userService.js";
import { userInputSchema } from "../schemas/userSchema.js";
import { AppError } from "../types/index.js";

export const userController = {
  async getAll(
    _req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const users = await userService.getAll();

      res.status(200).json({
        success: true,
        data: users,
        meta: { count: users.length },
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = await userService.getById(
        String(req.params.id)
      );

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = userInputSchema.safeParse(req.body);

      if (!result.success) {
        throw new AppError(
          "Invalid user data",
          400,
          "VALIDATION_ERROR"
        );
      }

      const user = await userService.create(result.data);

      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = userInputSchema.safeParse(req.body);

      if (!result.success) {
        throw new AppError(
          "Invalid user data",
          400,
          "VALIDATION_ERROR"
        );
      }

      const user = await userService.update(
        String(req.params.id),
        result.data
      );

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      await userService.delete(
        String(req.params.id)
      );

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};