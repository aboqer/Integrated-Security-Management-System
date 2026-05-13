import { Router } from "express";
import { query } from "../db";
import { asyncRoute, HttpError, sendCreated, sendOk } from "../http";
import { like, normalizePagination } from "../sql";

export const commitmentsRouter = Router();

commitmentsRouter.get("/", asyncRoute(async (req, res) => {
  const { limit, offset } = normalizePagination(req.query);
  const params: unknown[] = [];
  const filters: string[] = [];
  if (req.query.status) {
    params.push(req.query.status);
    filters.push(`c.status = $${params.length}::record_status`);
  }
  if (req.query.search) {
    params.push(like(req.query.search));
    filters.push(`(c.commitment_number ILIKE $${params.length} OR c.title ILIKE $${params.length} OR p.full_name_ar ILIKE $${params.length})`);
  }
  params.push(limit, offset);
  const result = await query(
    `
    SELECT c.*, p.full_name_ar AS person_name, ct.name_ar AS commitment_type_name, l.name_ar AS location_name
    FROM commitments c
    JOIN people p ON p.id = c.person_id
    LEFT JOIN commitment_types ct ON ct.id = c.commitment_type_id
    LEFT JOIN locations l ON l.id = c.location_id
    ${filters.length ? `WHERE ${filters.join(" AND ")}` : ""}
    ORDER BY c.committed_at DESC
    LIMIT $${params.length - 1} OFFSET $${params.length}
    `,
    params,
  );
  return sendOk(res, result.rows);
}));

commitmentsRouter.post("/", asyncRoute(async (req, res) => {
  const {
    commitmentNumber, personId, commitmentTypeId, relatedViolationId,
    relatedReportId, relatedDetaineeCaseId, departmentId, locationId,
    title, description, committedAt, dueAt, notes, assignedTo,
  } = req.body || {};
  if (!personId || !title || !description) {
    throw new HttpError(400, "personId, title and description are required");
  }
  const result = await query(
    `
    INSERT INTO commitments (
      commitment_number, person_id, commitment_type_id, related_violation_id,
      related_report_id, related_detainee_case_id, department_id, location_id,
      title, description, committed_at, due_at, notes, created_by, assigned_to
    )
    VALUES (
      COALESCE($1, 'CM-' || to_char(now(), 'YYYYMMDDHH24MISSMS')),
      $2, $3, $4, $5, $6, $7, $8, $9, $10,
      COALESCE($11, now()), $12, $13, $14, $15
    )
    RETURNING *
    `,
    [commitmentNumber || null, personId, commitmentTypeId || null, relatedViolationId || null, relatedReportId || null, relatedDetaineeCaseId || null, departmentId || null, locationId || null, title, description, committedAt || null, dueAt || null, notes || null, req.user?.id || null, assignedTo || null],
  );
  return sendCreated(res, result.rows[0]);
}));

commitmentsRouter.patch("/:id/status", asyncRoute(async (req, res) => {
  const { status, notes } = req.body || {};
  if (!status) throw new HttpError(400, "status is required");
  const result = await query(
    `
    UPDATE commitments
    SET status = $2::record_status,
        notes = COALESCE($3, notes),
        completed_at = CASE WHEN $2::record_status = 'closed' THEN now() ELSE completed_at END
    WHERE id = $1
    RETURNING *
    `,
    [req.params.id, status, notes || null],
  );
  if (!result.rows[0]) throw new HttpError(404, "Commitment not found");
  return sendOk(res, result.rows[0]);
}));
