import { Router } from "express";
import { query } from "../db";
import { asyncRoute, HttpError, sendCreated, sendOk } from "../http";
import { like, normalizePagination } from "../sql";

export const vehiclesRouter = Router();

vehiclesRouter.get(
  "/",
  asyncRoute(async (req, res) => {
    const { limit, offset } = normalizePagination(req.query);
    const search = String(req.query.search || "").trim();
    const params: unknown[] = [];
    let where = "";

    if (search) {
      params.push(like(search));
      where = "WHERE plate_number ILIKE $1";
    }

    params.push(limit, offset);
    const result = await query(
      `
      SELECT v.*, p.full_name_ar AS owner_name
      FROM vehicles v
      LEFT JOIN people p ON p.id = v.owner_person_id
      ${where}
      ORDER BY v.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
      `,
      params,
    );
    return sendOk(res, result.rows);
  }),
);

vehiclesRouter.post(
  "/",
  asyncRoute(async (req, res) => {
    const {
      ownerPersonId,
      plateNumber,
      plateCountry,
      plateProvince,
      plateCategory,
      vehicleType,
      color,
      notes,
    } = req.body || {};

    if (!plateNumber) throw new HttpError(400, "plateNumber is required");

    const result = await query(
      `
      INSERT INTO vehicles (
        owner_person_id, plate_number, plate_country, plate_province,
        plate_category, vehicle_type, color, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
      `,
      [
        ownerPersonId || null,
        plateNumber,
        plateCountry || null,
        plateProvince || null,
        plateCategory || null,
        vehicleType || null,
        color || null,
        notes || null,
      ],
    );

    return sendCreated(res, result.rows[0]);
  }),
);
