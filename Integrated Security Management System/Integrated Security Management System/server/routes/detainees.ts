import { Router } from "express";
import { query, withTransaction } from "../db";
import { asyncRoute, HttpError, sendCreated, sendOk } from "../http";
import { like, normalizePagination } from "../sql";

export const detaineesRouter = Router();

detaineesRouter.get("/", asyncRoute(async (req, res) => {
  const { limit, offset } = normalizePagination(req.query);
  const params: unknown[] = [];
  const filters: string[] = [];
  if (req.query.status) {
    params.push(req.query.status);
    filters.push(`dc.status = $${params.length}::record_status`);
  }
  if (req.query.search) {
    params.push(like(req.query.search));
    filters.push(`(dc.case_number ILIKE $${params.length} OR p.full_name_ar ILIKE $${params.length} OR dc.detention_reason ILIKE $${params.length})`);
  }
  params.push(limit, offset);
  const result = await query(
    `
    SELECT dc.*, p.full_name_ar AS person_name, l.name_ar AS location_name, d.name_ar AS department_name
    FROM detainee_cases dc
    JOIN people p ON p.id = dc.person_id
    LEFT JOIN locations l ON l.id = dc.location_id
    LEFT JOIN departments d ON d.id = dc.department_id
    ${filters.length ? `WHERE ${filters.join(" AND ")}` : ""}
    ORDER BY dc.detained_at DESC
    LIMIT $${params.length - 1} OFFSET $${params.length}
    `,
    params,
  );
  return sendOk(res, result.rows);
}));

detaineesRouter.post("/", asyncRoute(async (req, res) => {
  const {
    caseNumber, personId, primaryViolationId, primaryReportId, departmentId,
    locationId, detentionReason, legalBasis, requestedBy, detainedAt,
    expectedReleaseAt, notes, assignedTo,
  } = req.body || {};
  if (!personId || !detentionReason) throw new HttpError(400, "personId and detentionReason are required");

  const created = await withTransaction(async (client) => {
    const record = await client.query(
      `
      INSERT INTO detainee_cases (
        case_number, person_id, primary_violation_id, primary_report_id,
        department_id, location_id, detention_reason, legal_basis,
        requested_by, detained_at, expected_release_at, notes, created_by, assigned_to
      )
      VALUES (
        COALESCE($1, 'D-' || to_char(now(), 'YYYYMMDDHH24MISSMS')),
        $2, $3, $4, $5, $6, $7, $8, $9, COALESCE($10, now()), $11, $12, $13, $14
      )
      RETURNING *
      `,
      [caseNumber || null, personId, primaryViolationId || null, primaryReportId || null, departmentId || null, locationId || null, detentionReason, legalBasis || null, requestedBy || null, detainedAt || null, expectedReleaseAt || null, notes || null, req.user?.id || null, assignedTo || null],
    );
    await client.query(
      `
      INSERT INTO detainee_events (detainee_case_id, event_type, event_title, description, performed_by)
      VALUES ($1, 'created', 'تسجيل ملف موقوف', $2, $3)
      `,
      [record.rows[0].id, detentionReason, req.user?.id || null],
    );
    return record.rows[0];
  });

  return sendCreated(res, created);
}));

detaineesRouter.get("/:id", asyncRoute(async (req, res) => {
  const record = await query("SELECT * FROM detainee_cases WHERE id = $1", [req.params.id]);
  if (!record.rows[0]) throw new HttpError(404, "Detainee case not found");
  const events = await query("SELECT * FROM detainee_events WHERE detainee_case_id = $1 ORDER BY occurred_at DESC", [req.params.id]);
  return sendOk(res, { ...record.rows[0], events: events.rows });
}));

detaineesRouter.post("/:id/events", asyncRoute(async (req, res) => {
  const { eventType, eventTitle, description, fromDepartmentId, toDepartmentId, occurredAt } = req.body || {};
  if (!eventType || !eventTitle) throw new HttpError(400, "eventType and eventTitle are required");
  const result = await query(
    `
    INSERT INTO detainee_events (
      detainee_case_id, event_type, event_title, description,
      from_department_id, to_department_id, performed_by, occurred_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, now()))
    RETURNING *
    `,
    [req.params.id, eventType, eventTitle, description || null, fromDepartmentId || null, toDepartmentId || null, req.user?.id || null, occurredAt || null],
  );
  return sendCreated(res, result.rows[0]);
}));

detaineesRouter.post("/:id/release", asyncRoute(async (req, res) => {
  const { releaseReason } = req.body || {};
  if (!releaseReason) throw new HttpError(400, "releaseReason is required");
  const released = await withTransaction(async (client) => {
    const record = await client.query(
      "UPDATE detainee_cases SET status = 'closed', released_at = now(), release_reason = $2 WHERE id = $1 RETURNING *",
      [req.params.id, releaseReason],
    );
    if (!record.rows[0]) throw new HttpError(404, "Detainee case not found");
    await client.query(
      "INSERT INTO detainee_events (detainee_case_id, event_type, event_title, description, performed_by) VALUES ($1, 'released', 'إفراج / إغلاق ملف', $2, $3)",
      [req.params.id, releaseReason, req.user?.id || null],
    );
    return record.rows[0];
  });
  return sendOk(res, released);
}));
