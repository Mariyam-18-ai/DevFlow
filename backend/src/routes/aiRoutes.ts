import { Router } from "express";
import { aiController } from "../controllers/aiController.js";

export const aiRoutes = Router();
aiRoutes.get("/work-intelligence", aiController.workIntelligence);
aiRoutes.post("/generate-tasks", aiController.generateTasks);
