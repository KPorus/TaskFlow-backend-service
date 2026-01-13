import { AuthRequest, AuthUser } from "@/modules/auth/types/auth.types";
import { HTTP_STATUS_CODES } from "../utils/http-status-codes";
import { Team } from "@/modules/team/models/team.model";
import { Response, NextFunction } from "express";
import { AppError } from "../types/error.type";
import { Types } from "mongoose";
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded as AuthUser;

    next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      next(new AppError(HTTP_STATUS_CODES.UNAUTHORIZED, "Invalid token!"));
    } else {
      next(error);
    }
  }
};

export const requireRole =
  () => async (req: AuthRequest, _res: Response, next: NextFunction) => {
    const team = await Team.findById(req.body.teamId || req.params.teamId);

    if (!team) {
      return next(new AppError(HTTP_STATUS_CODES.NOT_FOUND, "Team not found"));
    }

    if (!req.user?.id) {
      return next(
        new AppError(HTTP_STATUS_CODES.UNAUTHORIZED, "User not found in token"),
      );
    }

    const isOwner =
      team.owner instanceof Types.ObjectId
        ? team.owner.equals(req.user.id)
        : // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (team.owner as any).toString() === String(req.user.id);

          // console.log("inside requiredRole",isOwner);
    if (!isOwner) {
      return next(new AppError(HTTP_STATUS_CODES.FORBIDDEN, "Forbidden"));
    }

    return next();
  };
