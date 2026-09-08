import cors from "cors";
import express, { Application } from "express";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { userRoutes } from "./routes/userRoutes.js";
import { projectRoutes } from "./routes/projectRoutes.js";
import { taskRoutes } from "./routes/taskRoutes.js";

export function createApp(): Application {
  const app = express();

  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.status(200).json({
      success: true,
      data: {
        status: "ok",
      },
    });
  });

  app.use("/api/users", userRoutes);
  app.use("/api/projects", projectRoutes);
  app.use("/api/tasks", taskRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
