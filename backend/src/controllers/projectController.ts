import { NextFunction, Request, Response } from "express";
import { projectService } from "../services/projectService.js";
import { projectInputSchema } from "../schemas/projectSchema.js";

export const projectController = {
  getAll(_req: Request, res: Response, next: NextFunction): void {
    try {
      const projects = projectService.getAll();
      res.status(200).json({ success: true, data: projects, meta: { count: projects.length } });
    } catch (err) {
      next(err);
    }
  },

  getById(req: Request, res: Response, next: NextFunction): void {
    try {
      const project = projectService.getById(req.params.id as string);
      res.status(200).json({ success: true, data: project });
    } catch (err) {
      next(err);
    }
  },

  create(req: Request, res: Response, next: NextFunction): void {
    try {
      const input = projectInputSchema.parse(req.body);
      const project = projectService.create(input);
      res.status(201).json({ success: true, data: project });
    } catch (err) {
      next(err);
    }
  },

  update(req: Request, res: Response, next: NextFunction): void {
    try {
      const input = projectInputSchema.parse(req.body);
      const project = projectService.update(req.params.id as string, input);
      res.status(200).json({ success: true, data: project });
    } catch (err) {
      next(err);
    }
  },

  delete(req: Request, res: Response, next: NextFunction): void {
    try {
      projectService.delete(req.params.id as string);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
