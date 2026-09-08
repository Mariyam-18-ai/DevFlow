import { NextFunction, Request, Response } from "express";
import { taskService } from "../services/taskService.js";
import { taskInputSchema, taskStatusSchema, taskFilterSchema } from "../schemas/taskSchema.js";

export const taskController = {
  getAll(req: Request, res: Response, next: NextFunction): void {
    try {
      const filter = taskFilterSchema.parse(req.query);
      const tasks = taskService.getAll(filter);
      res.status(200).json({ success: true, data: tasks, meta: { count: tasks.length } });
    } catch (err) {
      next(err);
    }
  },

  getById(req: Request, res: Response, next: NextFunction): void {
    try {
      const task = taskService.getById(req.params.id as string);
      res.status(200).json({ success: true, data: task });
    } catch (err) {
      next(err);
    }
  },

  create(req: Request, res: Response, next: NextFunction): void {
    try {
      const input = taskInputSchema.parse(req.body);
      const task = taskService.create(input);
      res.status(201).json({ success: true, data: task });
    } catch (err) {
      next(err);
    }
  },

  update(req: Request, res: Response, next: NextFunction): void {
    try {
      const input = taskInputSchema.parse(req.body);
      const task = taskService.update(req.params.id as string, input);
      res.status(200).json({ success: true, data: task });
    } catch (err) {
      next(err);
    }
  },

  updateStatus(req: Request, res: Response, next: NextFunction): void {
    try {
      const { status } = taskStatusSchema.parse(req.body);
      const task = taskService.updateStatus(req.params.id as string, status);
      res.status(200).json({ success: true, data: task });
    } catch (err) {
      next(err);
    }
  },

  delete(req: Request, res: Response, next: NextFunction): void {
    try {
      taskService.delete(req.params.id as string);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
