import { NextFunction, Request, Response } from "express";
import { AppError } from "../types/index.js";
import { generateTaskSuggestions, getWorkIntelligence } from "../services/aiService.js";

const WORKSPACES = new Set(["Engineering", "Design", "Personal"]);

export const aiController = {
  async generateTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = String(req.body?.projectId || "").trim();
      const brief = typeof req.body?.brief === "string" ? req.body.brief : undefined;

      if (!projectId) {
        throw new AppError("projectId is required.", 400, "INVALID_PROJECT_ID");
      }

      const result = await generateTaskSuggestions(req.userId!, projectId, brief);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async workIntelligence(req: Request, res: Response, next: NextFunction) {
    try {
      const requestedWorkspace = String(req.query.workspace || "Engineering");
      const workspace = WORKSPACES.has(requestedWorkspace)
        ? (requestedWorkspace as "Engineering" | "Design" | "Personal")
        : "Engineering";
      res.status(200).json({
        success: true,
        data: await getWorkIntelligence(req.userId!, workspace),
      });
    } catch (err) {
      next(err);
    }
  },
};
