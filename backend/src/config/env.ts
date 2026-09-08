import dotenv from "dotenv";

dotenv.config();

interface Env {
  PORT: number;
  NODE_ENV: string;
  CORS_ORIGIN: string;
}

export const env: Env = {
  PORT: Number(process.env.PORT) || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
};
