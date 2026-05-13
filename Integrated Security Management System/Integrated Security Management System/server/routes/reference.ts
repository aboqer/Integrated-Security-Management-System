import { Router } from "express";
import { query } from "../db";
import { asyncRoute, sendOk } from "../http";

export const referenceRouter = Router();

const referenceTables = {
  departments: "SELECT id, code, name_ar, name_en, description FROM departments WHERE is_active = true ORDER BY name_ar",
  locations: "SELECT id, code, name_ar, description, latitude, longitude FROM locations WHERE is_active = true ORDER BY name_ar",
  roles: "SELECT id, code, name_ar, description FROM roles ORDER BY name_ar",
  violationTypes: "SELECT id, category, title_ar, description, default_priority FROM violation_types WHERE is_active = true ORDER BY category, title_ar",
  reportCategories: "SELECT id, name_ar, description, default_priority FROM report_categories WHERE is_active = true ORDER BY name_ar",
  commitmentTypes: "SELECT id, name_ar, description, default_due_days FROM commitment_types WHERE is_active = true ORDER BY name_ar",
};

for (const [path, sql] of Object.entries(referenceTables)) {
  referenceRouter.get(
    `/${path}`,
    asyncRoute(async (_req, res) => {
      const result = await query(sql);
      return sendOk(res, result.rows);
    }),
  );
}
