import { Router } from "express";
import { query } from "../db";
import { signToken } from "../auth";
import { asyncRoute, HttpError, sendOk } from "../http";

export const authRouter = Router();

authRouter.post(
  "/login",
  asyncRoute(async (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password) {
      throw new HttpError(400, "Username and password are required");
    }

    const result = await query(
      `
      SELECT
        u.id,
        u.username,
        u.full_name_ar,
        u.department_id,
        r.code AS role_code
      FROM users u
      LEFT JOIN roles r ON r.id = u.role_id
      WHERE u.username = $1
        AND u.is_active = true
        AND u.password_hash = crypt($2, u.password_hash)
      LIMIT 1
      `,
      [username, password],
    );

    const user = result.rows[0];
    if (!user) {
      throw new HttpError(401, "Invalid username or password");
    }

    await query("UPDATE users SET last_login_at = now() WHERE id = $1", [user.id]);

    const token = signToken({
      id: user.id,
      username: user.username,
      roleCode: user.role_code,
      departmentId: user.department_id,
    });

    return sendOk(res, {
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name_ar,
        roleCode: user.role_code,
        departmentId: user.department_id,
      },
    });
  }),
);
