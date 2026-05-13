import { Router } from "express";
import { query } from "../db";
import { asyncRoute, HttpError, sendCreated, sendOk } from "../http";
import { like, normalizePagination } from "../sql";

export const violationsRouter = Router();

violationsRouter.get(
  "/",
  asyncRoute(async (req, res) => {
    const { limit, offset } = normalizePagination(req.query);
    const params: unknown[] = [];
    const filters: string[] = [];

    if (req.query.status) {
      params.push(req.query.status);
      filters.push(`v.status = $${params.length}::record_status`);
    }
    if (req.query.category) {
      params.push(req.query.category);
      filters.push(`vt.category = $${params.length}`);
    }
    if (req.query.search) {
      params.push(like(req.query.search));
      filters.push(`(v.serial_number ILIKE $${params.length} OR v.title ILIKE $${params.length} OR p.full_name_ar ILIKE $${params.length} OR ve.plate_number ILIKE $${params.length})`);
    }

    params.push(limit, offset);
    const result = await query(
      `
      SELECT
        v.*,
        vt.category,
        vt.title_ar AS violation_type_title,
        p.full_name_ar AS person_name,
        ve.plate_number,
        l.name_ar AS location_name,
        d.name_ar AS department_name
      FROM violations v
      LEFT JOIN violation_types vt ON vt.id = v.violation_type_id
      LEFT JOIN people p ON p.id = v.person_id
      LEFT JOIN vehicles ve ON ve.id = v.vehicle_id
      LEFT JOIN locations l ON l.id = v.location_id
      LEFT JOIN departments d ON d.id = v.department_id
      ${filters.length ? `WHERE ${filters.join(" AND ")}` : ""}
      ORDER BY v.occurred_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
      `,
      params,
    );
    return sendOk(res, result.rows);
  }),
);

violationsRouter.post(
  "/",
  asyncRoute(async (req, res) => {
    const {
      serialNumber,
      violationTypeId,
      personId,
      vehicleId,
      departmentId,
      locationId,
      priority,
      title,
      description,
      occurredAt,
      assignedTo,
    } = req.body || {};

    if (!title || !description) throw new HttpError(400, "title and description are required");

    const result = await query(
      `
      INSERT INTO violations (
        serial_number, violation_type_id, person_id, vehicle_id, department_id,
        location_id, priority, title, description, occurred_at, created_by, assigned_to
      )
      VALUES (
        COALESCE($1, 'V-' || to_char(now(), 'YYYYMMDDHH24MISSMS')),
        $2, $3, $4, $5, $6, COALESCE($7, 'normal')::priority_level,
        $8, $9, COALESCE($10, now()), $11, $12
      )
      RETURNING *
      `,
      [
        serialNumber || null,
        violationTypeId || null,
        personId || null,
        vehicleId || null,
        departmentId || null,
        locationId || null,
        priority || null,
        title,
        description,
        occurredAt || null,
        req.user?.id || null,
        assignedTo || null,
      ],
    );

    return sendCreated(res, result.rows[0]);
  }),
);

violationsRouter.get("/:id", asyncRoute(async (req, res) => {
  const result = await query("SELECT * FROM violations WHERE id = $1", [req.params.id]);
  if (!result.rows[0]) throw new HttpError(404, "Violation not found");
  return sendOk(res, result.rows[0]);
}));

violationsRouter.patch("/:id/status", asyncRoute(async (req, res) => {
  const { status, reason } = req.body || {};
  if (!status) throw new HttpError(400, "status is required");

  const result = await query(
    `
    WITH old AS (SELECT status FROM violations WHERE id = $1)
    UPDATE violations SET status = $2::record_status, closed_at = CASE WHEN $2::record_status = 'closed' THEN now() ELSE closed_at END
    WHERE id = $1
    RETURNING *, (SELECT status FROM old) AS old_status
    `,
    [req.params.id, status],
  );
  if (!result.rows[0]) throw new HttpError(404, "Violation not found");

  await query(
    "INSERT INTO status_history (entity_type, entity_id, old_status, new_status, reason, changed_by) VALUES ('violation', $1, $2, $3::record_status, $4, $5)",
    [req.params.id, result.rows[0].old_status, status, reason || null, req.user?.id || null],
  );

  return sendOk(res, result.rows[0]);
}));
