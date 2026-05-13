import { Router } from "express";
import { query } from "../db";
import { asyncRoute, HttpError, sendCreated, sendOk } from "../http";
import { like, normalizePagination } from "../sql";

export const reportsRouter = Router();

reportsRouter.get("/", asyncRoute(async (req, res) => {
  const { limit, offset } = normalizePagination(req.query);
  const params: unknown[] = [];
  const filters: string[] = [];
  if (req.query.status) {
    params.push(req.query.status);
    filters.push(`rc.status = $${params.length}::record_status`);
  }
  if (req.query.search) {
    params.push(like(req.query.search));
    filters.push(`(rc.ticket_number ILIKE $${params.length} OR rc.title ILIKE $${params.length} OR rc.description ILIKE $${params.length})`);
  }
  params.push(limit, offset);
  const result = await query(
    `
    SELECT rc.*, cat.name_ar AS category_name, l.name_ar AS location_name, d.name_ar AS department_name
    FROM reports_complaints rc
    LEFT JOIN report_categories cat ON cat.id = rc.category_id
    LEFT JOIN locations l ON l.id = rc.location_id
    LEFT JOIN departments d ON d.id = rc.department_id
    ${filters.length ? `WHERE ${filters.join(" AND ")}` : ""}
    ORDER BY rc.reported_at DESC
    LIMIT $${params.length - 1} OFFSET $${params.length}
    `,
    params,
  );
  return sendOk(res, result.rows);
}));

reportsRouter.post("/", asyncRoute(async (req, res) => {
  const {
    ticketNumber, categoryId, reporterPersonId, relatedPersonId, departmentId,
    locationId, priority, source, title, description, assignedTo,
  } = req.body || {};
  if (!title || !description) throw new HttpError(400, "title and description are required");

  const result = await query(
    `
    INSERT INTO reports_complaints (
      ticket_number, category_id, reporter_person_id, related_person_id,
      department_id, location_id, priority, source, title, description,
      created_by, assigned_to
    )
    VALUES (
      COALESCE($1, 'R-' || to_char(now(), 'YYYYMMDDHH24MISSMS')),
      $2, $3, $4, $5, $6, COALESCE($7, 'normal')::priority_level,
      $8, $9, $10, $11, $12
    )
    RETURNING *
    `,
    [ticketNumber || null, categoryId || null, reporterPersonId || null, relatedPersonId || null, departmentId || null, locationId || null, priority || null, source || null, title, description, req.user?.id || null, assignedTo || null],
  );
  return sendCreated(res, result.rows[0]);
}));

reportsRouter.patch("/:id/status", asyncRoute(async (req, res) => {
  const { status, resolutionSummary } = req.body || {};
  if (!status) throw new HttpError(400, "status is required");
  const result = await query(
    `
    UPDATE reports_complaints
    SET status = $2::record_status,
        resolution_summary = COALESCE($3, resolution_summary),
        closed_at = CASE WHEN $2::record_status = 'closed' THEN now() ELSE closed_at END
    WHERE id = $1
    RETURNING *
    `,
    [req.params.id, status, resolutionSummary || null],
  );
  if (!result.rows[0]) throw new HttpError(404, "Report not found");
  return sendOk(res, result.rows[0]);
}));
