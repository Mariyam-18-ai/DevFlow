import cors from "cors";
import express, { Application } from "express";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { userRoutes } from "./routes/userRoutes.js";
import { projectRoutes } from "./routes/projectRoutes.js";
import { taskRoutes } from "./routes/taskRoutes.js";
import { authRoutes } from "./routes/authRoutes.js";
import { requireAuth } from "./middleware/authMiddleware.js";
import { aiRoutes } from "./routes/aiRoutes.js";

export function createApp(): Application {
  const app = express();

  const allowedOrigins = [
    env.CORS_ORIGIN,
    "http://localhost:5173",
    "https://devflow-zeta-inky.vercel.app",
  ];

  app.use(cors({ origin: allowedOrigins }));
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.status(200).json({
      success: true,
      data: {
        status: "ok",
      },
    });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/ai", requireAuth, aiRoutes);
  app.use("/api/users", requireAuth, userRoutes);
  app.use("/api/projects", requireAuth, projectRoutes);
  app.use("/api/tasks", requireAuth, taskRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
