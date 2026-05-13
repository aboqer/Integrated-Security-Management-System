import { Router } from "express";
import { query } from "../db";
import { asyncRoute, sendOk } from "../http";
import { normalizePagination } from "../sql";

export const auditRouter = Router();

auditRouter.get("/", asyncRoute(async (req, res) => {
  const { limit, offset } = normalizePagination(req.query);
  const result = await query(
    `
    SELECT al.*, u.username, u.full_name_ar AS actor_name
    FROM audit_logs al
    LEFT JOIN users u ON u.id = al.actor_user_id
    ORDER BY al.created_at DESC
    LIMIT $1 OFFSET $2
    `,
    [limit, offset],
  );
  return sendOk(res, result.rows);
}));
