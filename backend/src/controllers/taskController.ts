import { NextFunction, Request, Response } from "express";
import { taskService } from "../services/taskService.js";
import {
  taskInputSchema,
  taskStatusSchema,
  taskFilterSchema,
} from "../schemas/taskSchema.js";

export const taskController = {
  async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const filter = taskFilterSchema.parse(req.query);
      const tasks = await taskService.getAll(filter);
      res.status(200).json({
        success: true,
        data: tasks,
        meta: { count: tasks.length },
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
      const task = await taskService.getById(
        String(req.params.id)
      );
      res.status(200).json({ success: true, data: task });
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
      const input = taskInputSchema.parse(req.body);
      const task = await taskService.create(input);
      res.status(201).json({ success: true, data: task });
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
      const input = taskInputSchema.parse(req.body);
      const task = await taskService.update(
        String(req.params.id),
        input
      );
      res.status(200).json({ success: true, data: task });
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { status } = taskStatusSchema.parse(req.body);
      const task = await taskService.updateStatus(
        String(req.params.id),
        status
      );
      res.status(200).json({ success: true, data: task });
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
      await taskService.delete(String(req.params.id));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
