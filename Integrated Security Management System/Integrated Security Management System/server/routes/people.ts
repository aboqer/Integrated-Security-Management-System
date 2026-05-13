import { Router } from "express";
import { query, withTransaction } from "../db";
import { asyncRoute, HttpError, sendCreated, sendOk } from "../http";
import { like, normalizePagination } from "../sql";

export const peopleRouter = Router();

peopleRouter.get(
  "/",
  asyncRoute(async (req, res) => {
    const { limit, offset } = normalizePagination(req.query);
    const search = String(req.query.search || "").trim();
    const params: unknown[] = [];
    let where = "";

    if (search) {
      params.push(like(search), search);
      where = `
        WHERE p.full_name_ar ILIKE $1
          OR EXISTS (
            SELECT 1 FROM person_identities pi
            WHERE pi.person_id = p.id AND pi.id_number = $2
          )
          OR EXISTS (
            SELECT 1 FROM person_phones pp
            WHERE pp.person_id = p.id AND pp.phone ILIKE $1
          )
      `;
    }

    params.push(limit, offset);
    const result = await query(
      `
      SELECT p.*
      FROM people p
      ${where}
      ORDER BY p.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
      `,
      params,
    );
    return sendOk(res, result.rows);
  }),
);

peopleRouter.post(
  "/",
  asyncRoute(async (req, res) => {
    const { fullNameAr, fullNameEn, nationality, gender, birthDate, idType, idNumber, phone, notes } = req.body || {};
    if (!fullNameAr) throw new HttpError(400, "fullNameAr is required");

    const created = await withTransaction(async (client) => {
      const person = await client.query(
        `
        INSERT INTO people (full_name_ar, full_name_en, nationality, gender, birth_date, notes, created_by)
        VALUES ($1, $2, $3, COALESCE($4, 'unknown')::person_gender, $5, $6, $7)
        RETURNING *
        `,
        [fullNameAr, fullNameEn || null, nationality || null, gender || null, birthDate || null, notes || null, req.user?.id || null],
      );

      if (idType && idNumber) {
        await client.query(
          `
          INSERT INTO person_identities (person_id, id_type, id_number, is_primary)
          VALUES ($1, $2, $3, true)
          ON CONFLICT (id_type, id_number) DO NOTHING
          `,
          [person.rows[0].id, idType, idNumber],
        );
      }

      if (phone) {
        await client.query(
          `
          INSERT INTO person_phones (person_id, phone, is_primary)
          VALUES ($1, $2, true)
          ON CONFLICT (person_id, phone) DO NOTHING
          `,
          [person.rows[0].id, phone],
        );
      }

      return person.rows[0];
    });

    return sendCreated(res, created);
  }),
);

peopleRouter.get(
  "/:id",
  asyncRoute(async (req, res) => {
    const person = await query("SELECT * FROM people WHERE id = $1", [req.params.id]);
    if (!person.rows[0]) throw new HttpError(404, "Person not found");

    const identities = await query("SELECT * FROM person_identities WHERE person_id = $1 ORDER BY is_primary DESC", [req.params.id]);
    const phones = await query("SELECT * FROM person_phones WHERE person_id = $1 ORDER BY is_primary DESC", [req.params.id]);
    const vehicles = await query("SELECT * FROM vehicles WHERE owner_person_id = $1 ORDER BY created_at DESC", [req.params.id]);

    return sendOk(res, {
      ...person.rows[0],
      identities: identities.rows,
      phones: phones.rows,
      vehicles: vehicles.rows,
    });
  }),
);
