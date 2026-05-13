import express from "express";
import cors from "cors";
import { config } from "./config";
import { pool, query } from "./db";
import { HttpError } from "./http";
import { apiRouter } from "./routes";

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (config.nodeEnv !== "production") {
        callback(null, true);
        return;
      }

      if (!origin || config.corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", async (_req, res, next) => {
  try {
    const db = await query("SELECT now() AS now");
    res.json({
      ok: true,
      service: "security-management-api",
      databaseTime: db.rows[0].now,
    });
  } catch (error) {
    next(error);
  }
});

app.use("/api", apiRouter);

app.use((_req, _res, next) => {
  next(new HttpError(404, "Route not found"));
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = error instanceof HttpError ? error.status : 500;
  const message = error instanceof Error ? error.message : "Unexpected server error";

  if (status >= 500) {
    console.error(error);
  }

  res.status(status).json({
    error: {
      message,
      status,
    },
  });
});

const server = app.listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`);
});

async function shutdown() {
  server.close();
  await pool.end();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
