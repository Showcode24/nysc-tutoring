import { Request, Response, NextFunction } from "express";
import { verifyJWT, extractBearerToken, formatError } from "@/utils/index";
import { JWTPayload } from "@/types/index";

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      token?: string;
    }
  }
}

/**
 * Authentication Middleware
 * Validates JWT token from Authorization header
 * Extracts user info and attaches to request object
 * Does NOT require authentication - just validates if token is present
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = extractBearerToken(req.headers.authorization);

  if (token) {
    const decoded = verifyJWT(token, process.env.JWT_SECRET || "");
    if (decoded) {
      req.user = decoded as JWTPayload;
      req.token = token;
    }
  }

  next();
};

/**
 * Require Authentication Middleware
 * Ensures a valid JWT token is present
 * Used for protected routes
 */
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res
      .status(401)
      .json(formatError("Authentication required", "UNAUTHORIZED"));
  }
  next();
};

/**
 * Require Admin Middleware
 * Ensures user is authenticated AND has admin role
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res
      .status(401)
      .json(formatError("Authentication required", "UNAUTHORIZED"));
  }

  if (req.user.userType !== "ADMIN") {
    return res.status(403).json(formatError("Admin access required", "FORBIDDEN"));
  }

  next();
};

/**
 * Require Tutor Middleware
 * Ensures user is authenticated AND is a tutor
 */
export const requireTutor = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res
      .status(401)
      .json(formatError("Authentication required", "UNAUTHORIZED"));
  }

  if (req.user.userType !== "TUTOR") {
    return res
      .status(403)
      .json(formatError("Tutor access required", "FORBIDDEN"));
  }

  next();
};

/**
 * Role-Based Access Control Middleware Factory
 * Returns middleware that checks if user has required admin role
 */
export const requireAdminRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res
        .status(401)
        .json(formatError("Authentication required", "UNAUTHORIZED"));
    }

    if (req.user.userType !== "ADMIN") {
      return res
        .status(403)
        .json(formatError("Admin access required", "FORBIDDEN"));
    }

    if (!req.user.adminRole || !allowedRoles.includes(req.user.adminRole)) {
      return res.status(403).json(
        formatError(
          `This action requires one of these roles: ${allowedRoles.join(", ")}`,
          "INSUFFICIENT_ROLE"
        )
      );
    }

    next();
  };
};
