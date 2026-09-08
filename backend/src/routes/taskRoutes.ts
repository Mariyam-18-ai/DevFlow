import { Router } from "express";
import { taskController } from "../controllers/taskController.js";

export const taskRoutes = Router();

taskRoutes.get("/", taskController.getAll);
taskRoutes.get("/:id", taskController.getById);
taskRoutes.post("/", taskController.create);
taskRoutes.put("/:id", taskController.update);
taskRoutes.patch("/:id/status", taskController.updateStatus);
taskRoutes.delete("/:id", taskController.delete);
