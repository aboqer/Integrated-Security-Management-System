import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "./config";
import { HttpError } from "./http";

export interface AuthUser {
  id: string;
  username: string;
  roleCode?: string;
  departmentId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function signToken(user: AuthUser) {
  return jwt.sign(user, config.jwtSecret, { expiresIn: "12h" });
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new HttpError(401, "Authentication is required");
  }

  try {
    req.user = jwt.verify(header.slice("Bearer ".length), config.jwtSecret) as AuthUser;
    next();
  } catch {
    throw new HttpError(401, "Invalid or expired token");
  }
}
