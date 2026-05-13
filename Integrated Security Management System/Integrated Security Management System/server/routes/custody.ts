import { Router } from "express";
import { query, withTransaction } from "../db";
import { asyncRoute, HttpError, sendCreated, sendOk } from "../http";
import { like, normalizePagination } from "../sql";

export const custodyRouter = Router();

custodyRouter.get("/", asyncRoute(async (req, res) => {
  const { limit, offset } = normalizePagination(req.query);
  const params: unknown[] = [];
  const filters: string[] = [];

  if (req.query.status) {
    params.push(req.query.status);
    filters.push(`cr.status = $${params.length}::record_status`);
  }
  if (req.query.search) {
    params.push(like(req.query.search));
    filters.push(`(cr.ticket_number ILIKE $${params.length} OR p.full_name_ar ILIKE $${params.length})`);
  }

  params.push(limit, offset);
  const result = await query(
    `
    SELECT cr.*, p.full_name_ar AS person_name, l.name_ar AS location_name,
      COUNT(ci.id)::int AS items_count
    FROM custody_records cr
    LEFT JOIN people p ON p.id = cr.person_id
    LEFT JOIN locations l ON l.id = cr.location_id
    LEFT JOIN custody_items ci ON ci.custody_record_id = cr.id
    ${filters.length ? `WHERE ${filters.join(" AND ")}` : ""}
    GROUP BY cr.id, p.full_name_ar, l.name_ar
    ORDER BY cr.received_at DESC
    LIMIT $${params.length - 1} OFFSET $${params.length}
    `,
    params,
  );
  return sendOk(res, result.rows);
}));

custodyRouter.post("/", asyncRoute(async (req, res) => {
  const { ticketNumber, personId, departmentId, locationId, notes, items = [] } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    throw new HttpError(400, "At least one custody item is required");
  }

  const created = await withTransaction(async (client) => {
    const record = await client.query(
      `
      INSERT INTO custody_records (ticket_number, person_id, department_id, location_id, notes, created_by)
      VALUES (COALESCE($1, 'C-' || to_char(now(), 'YYYYMMDDHH24MISSMS')), $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [ticketNumber || null, personId || null, departmentId || null, locationId || null, notes || null, req.user?.id || null],
    );

    for (const item of items) {
      await client.query(
        `
        INSERT INTO custody_items (
          custody_record_id, item_category, item_name, quantity, unit,
          estimated_value, currency, description, storage_location
        )
        VALUES ($1, $2, $3, COALESCE($4, 1), COALESCE($5, 'piece'), $6, COALESCE($7, 'SAR'), $8, $9)
        `,
        [
          record.rows[0].id,
          item.itemCategory,
          item.itemName,
          item.quantity || null,
          item.unit || null,
          item.estimatedValue || null,
          item.currency || null,
          item.description || null,
          item.storageLocation || null,
        ],
      );
    }

    return record.rows[0];
  });

  return sendCreated(res, created);
}));

custodyRouter.get("/:id", asyncRoute(async (req, res) => {
  const record = await query("SELECT * FROM custody_records WHERE id = $1", [req.params.id]);
  if (!record.rows[0]) throw new HttpError(404, "Custody record not found");
  const items = await query("SELECT * FROM custody_items WHERE custody_record_id = $1 ORDER BY created_at", [req.params.id]);
  const deliveries = await query("SELECT * FROM custody_deliveries WHERE custody_record_id = $1 ORDER BY delivered_at DESC", [req.params.id]);
  return sendOk(res, { ...record.rows[0], items: items.rows, deliveries: deliveries.rows });
}));

custodyRouter.post("/:id/deliver", asyncRoute(async (req, res) => {
  const { receiverName, receiverIdType, receiverIdNumber, authorizedBy, deliveryStatus, notes } = req.body || {};
  if (!receiverName || !authorizedBy) {
    throw new HttpError(400, "receiverName and authorizedBy are required");
  }

  const delivered = await withTransaction(async (client) => {
    const delivery = await client.query(
      `
      INSERT INTO custody_deliveries (
        custody_record_id, receiver_name, receiver_id_type, receiver_id_number,
        authorized_by, delivery_status, delivered_by, notes
      )
      VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'delivered'), $7, $8)
      RETURNING *
      `,
      [req.params.id, receiverName, receiverIdType || null, receiverIdNumber || null, authorizedBy, deliveryStatus || null, req.user?.id || null, notes || null],
    );

    await client.query("UPDATE custody_records SET status = 'closed', delivered_at = now() WHERE id = $1", [req.params.id]);
    await client.query("UPDATE custody_items SET status = 'closed' WHERE custody_record_id = $1", [req.params.id]);
    return delivery.rows[0];
  });

  return sendCreated(res, delivered);
}));
