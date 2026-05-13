import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import multer from "multer";
import { config } from "../config";
import { query } from "../db";
import { asyncRoute, HttpError, sendCreated, sendOk } from "../http";

fs.mkdirSync(config.uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, config.uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
});

export const attachmentsRouter = Router();

attachmentsRouter.get("/", asyncRoute(async (req, res) => {
  const { ownerType, ownerId } = req.query;
  if (!ownerType || !ownerId) throw new HttpError(400, "ownerType and ownerId are required");
  const result = await query(
    "SELECT * FROM attachments WHERE owner_type = $1::attachment_owner_type AND owner_id = $2 ORDER BY uploaded_at DESC",
    [ownerType, ownerId],
  );
  return sendOk(res, result.rows);
}));

attachmentsRouter.post("/", upload.single("file"), asyncRoute(async (req, res) => {
  const { ownerType, ownerId, notes } = req.body || {};
  if (!ownerType || !ownerId) throw new HttpError(400, "ownerType and ownerId are required");
  if (!req.file) throw new HttpError(400, "file is required");

  const result = await query(
    `
    INSERT INTO attachments (
      owner_type, owner_id, file_name, file_ext, mime_type, file_size_bytes,
      storage_key, uploaded_by, notes
    )
    VALUES ($1::attachment_owner_type, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
    `,
    [
      ownerType,
      ownerId,
      req.file.originalname,
      path.extname(req.file.originalname).replace(".", ""),
      req.file.mimetype,
      req.file.size,
      req.file.path,
      req.user?.id || null,
      notes || null,
    ],
  );

  return sendCreated(res, result.rows[0]);
}));

attachmentsRouter.get("/:id/download", asyncRoute(async (req, res) => {
  const result = await query("SELECT * FROM attachments WHERE id = $1", [req.params.id]);
  const attachment = result.rows[0];
  if (!attachment) throw new HttpError(404, "Attachment not found");
  return res.download(attachment.storage_key, attachment.file_name);
}));
