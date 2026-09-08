import { Router } from "express";
import { projectController } from "../controllers/projectController.js";

export const projectRoutes = Router();

projectRoutes.get("/", projectController.getAll);
projectRoutes.get("/:id", projectController.getById);
projectRoutes.post("/", projectController.create);
projectRoutes.put("/:id", projectController.update);
projectRoutes.delete("/:id", projectController.delete);
