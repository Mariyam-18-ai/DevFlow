import { Request, Response, NextFunction } from "express";
import { taskService } from "../services/taskService.js";
import {
  taskInputSchema,
  taskStatusSchema,
  taskFilterSchema,
} from "../schemas/taskSchema.js";
import { AppError } from "../types/index.js";

export const taskController = {
  async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = taskFilterSchema.safeParse(req.query);

      if (!result.success) {
        throw new AppError(
          "Invalid task filters",
          400,
          "VALIDATION_ERROR"
        );
      }

      const tasks = await taskService.getAll(result.data);

      res.status(200).json({
        success: true,
        data: tasks,
        meta: { count: tasks.length },
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
      const task = await taskService.getById(
        String(req.params.id)
      );

      res.status(200).json({
        success: true,
        data: task,
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
      const result = taskInputSchema.safeParse(req.body);

      if (!result.success) {
        throw new AppError(
          "Invalid task data",
          400,
          "VALIDATION_ERROR"
        );
      }

      const task = await taskService.create(result.data);

      res.status(201).json({
        success: true,
        data: task,
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
      const result = taskInputSchema.safeParse(req.body);

      if (!result.success) {
        throw new AppError(
          "Invalid task data",
          400,
          "VALIDATION_ERROR"
        );
      }

      const task = await taskService.update(
        String(req.params.id),
        result.data
      );

      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = taskStatusSchema.safeParse(req.body);

      if (!result.success) {
        throw new AppError(
          "Invalid task status",
          400,
          "VALIDATION_ERROR"
        );
      }

      const task = await taskService.updateStatus(
        String(req.params.id),
        result.data.status
      );

      res.status(200).json({
        success: true,
        data: task,
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
      await taskService.delete(
        String(req.params.id)
      );

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};