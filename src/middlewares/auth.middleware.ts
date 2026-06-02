import {
  AuthRequest,
  AuthUser,
  UserRole,
} from "@/modules/auth/types/auth.types";
import { checkProjectAccess, ProjectAction } from "@/helpers/permission.helper";
import { Project } from "@/modules/project/models/project.model";
import { HTTP_STATUS_CODES } from "../utils/http-status-codes";
import { Response, NextFunction } from "express";
import { AppError } from "../types/error.type";
import jwt from "jsonwebtoken";

export const authenticateJWT = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return next(
      new AppError(
        HTTP_STATUS_CODES.UNAUTHORIZED,
        "Access Denied! No token was provided",
      ),
    );
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as AuthUser;
    req.user = {
      ...decoded,
      role: decoded.role ?? UserRole.TEAM_MEMBER,
    };
    next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      next(new AppError(HTTP_STATUS_CODES.UNAUTHORIZED, "Invalid token!"));
    } else {
      next(error);
    }
  }
};

export const requireGlobalRole =
  (...roles: UserRole[]) =>
  (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user?.role || !roles.includes(req.user.role)) {
      return next(new AppError(HTTP_STATUS_CODES.FORBIDDEN, "Forbidden"));
    }
    return next();
  };

export const requireProjectAccess =
  (action: ProjectAction = "manage") =>
  async (req: AuthRequest, _res: Response, next: NextFunction) => {
    const projectId =
      req.body.projectId || req.params.projectId || req.params.teamId;

    if (!projectId) {
      return next(
        new AppError(HTTP_STATUS_CODES.BAD_REQUEST, "Project ID required"),
      );
    }

    const project = await Project.findByProjectId(projectId);
    if (!project) {
      return next(
        new AppError(HTTP_STATUS_CODES.NOT_FOUND, "Project not found"),
      );
    }

    if (!req.user?.id) {
      return next(
        new AppError(HTTP_STATUS_CODES.UNAUTHORIZED, "User not found in token"),
      );
    }

    const allowed = await checkProjectAccess(req.user, projectId, action);
    if (!allowed) {
      return next(new AppError(HTTP_STATUS_CODES.FORBIDDEN, "Forbidden"));
    }

    return next();
  };

/** @deprecated use requireProjectAccess */
export const requireRole = requireProjectAccess("manage");
