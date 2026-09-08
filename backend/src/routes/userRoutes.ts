import { Router } from "express";
import { userController } from "../controllers/userController.js";

export const userRoutes = Router();

userRoutes.get("/", userController.getAll);
userRoutes.get("/:id", userController.getById);
userRoutes.post("/", userController.create);
userRoutes.put("/:id", userController.update);
userRoutes.delete("/:id", userController.delete);
