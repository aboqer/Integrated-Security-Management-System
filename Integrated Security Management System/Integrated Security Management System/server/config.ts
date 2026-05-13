import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.API_PORT || process.env.PORT || 8000),
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgres://postgres:postgres@localhost:5432/security_management",
  jwtSecret: process.env.JWT_SECRET || "dev-change-me-before-production",
  uploadDir: process.env.UPLOAD_DIR || "uploads",
  corsOrigins: (process.env.CORS_ORIGIN || "http://localhost:3000,http://127.0.0.1:3000")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean),
};
