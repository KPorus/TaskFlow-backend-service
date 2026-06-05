import { HTTP_STATUS_CODES } from "@/utils/http-status-codes";
import { NextFunction, Request, Response } from "express";
import { AppError } from "@/types/error.type";

export const requireInternalAccess = (
  _req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (process.env.NODE_ENV === "development") {
    return next();
  }

  return next(new AppError(HTTP_STATUS_CODES.NOT_FOUND, "Route not found"));
};
