import { Request, Response, NextFunction } from "express";
import { projectService } from "../services/projectService.js";
import { projectInputSchema } from "../schemas/projectSchema.js";
import { AppError } from "../types/index.js";

export const projectController = {
  async getAll(
    _req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const projects = await projectService.getAll();

      res.status(200).json({
        success: true,
        data: projects,
        meta: { count: projects.length },
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
      const project = await projectService.getById(
        String(req.params.id)
      );

      res.status(200).json({
        success: true,
        data: project,
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
      const result = projectInputSchema.safeParse(req.body);

      if (!result.success) {
        throw new AppError(
          "Invalid project data",
          400,
          "VALIDATION_ERROR"
        );
      }

      const project = await projectService.create(result.data);

      res.status(201).json({
        success: true,
        data: project,
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
      const result = projectInputSchema.safeParse(req.body);

      if (!result.success) {
        throw new AppError(
          "Invalid project data",
          400,
          "VALIDATION_ERROR"
        );
      }

      const project = await projectService.update(
        String(req.params.id),
        result.data
      );

      res.status(200).json({
        success: true,
        data: project,
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
      await projectService.delete(
        String(req.params.id)
      );

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};