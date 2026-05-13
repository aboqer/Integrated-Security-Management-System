import { Router } from "express";
import { query } from "../db";
import { asyncRoute, sendOk } from "../http";

export const dashboardRouter = Router();

dashboardRouter.get("/summary", asyncRoute(async (_req, res) => {
  const result = await query(
    `
    SELECT
      (SELECT COUNT(*)::int FROM violations WHERE status <> 'closed') AS open_violations,
      (SELECT COUNT(*)::int FROM custody_records WHERE status <> 'closed') AS pending_custody,
      (SELECT COUNT(*)::int FROM reports_complaints WHERE status <> 'closed') AS open_reports,
      (SELECT COUNT(*)::int FROM detainee_cases WHERE status <> 'closed') AS active_detainees,
      (SELECT COUNT(*)::int FROM commitments WHERE status <> 'closed') AS open_commitments,
      (SELECT COUNT(*)::int FROM commitments WHERE status <> 'closed' AND due_at IS NOT NULL AND due_at < now()) AS overdue_commitments
    `,
  );
  return sendOk(res, result.rows[0]);
}));
