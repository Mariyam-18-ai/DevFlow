import { NextFunction, Request, Response } from "express";
import { projectService } from "../services/projectService.js";
import { projectInputSchema } from "../schemas/projectSchema.js";

export const projectController = {
  async getAll(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const projects = await projectService.getAll();
      res.status(200).json({
        success: true,
        data: projects,
        meta: { count: projects.length },
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
      const project = await projectService.getById(
        String(req.params.id)
      );
      res.status(200).json({ success: true, data: project });
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
      const input = projectInputSchema.parse(req.body);
      const project = await projectService.create(input);
      res.status(201).json({ success: true, data: project });
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
      const input = projectInputSchema.parse(req.body);
      const project = await projectService.update(
        String(req.params.id),
        input
      );
      res.status(200).json({ success: true, data: project });
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
      await projectService.delete(String(req.params.id));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
