import { HTTP_STATUS_CODES } from "./http-status-codes";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { AppError } from "@/types/error.type";
import { Types } from "mongoose";
type StringValue = `${number}${"d" | "h" | "m" | "s"}`;
export const generateToken = (
  payload: { id: Types.ObjectId; email: string },
  expiresIn: StringValue = "1d",
) => {
  const secret: Secret = process.env.JWT_SECRET as string;

  if (!secret) {
    throw new Error("JWT secret is not defined in environment variables");
  }
  const acessOptions: SignOptions = {
    expiresIn,
  };
  const refreshOptions: SignOptions = {
    expiresIn: "7d",
  };
  const acessToken = jwt.sign(payload, secret, acessOptions);

  const refreshToken = jwt.sign(payload, secret, refreshOptions);

  return { acessToken, refreshToken };
};

export const verifyToken = (token: string) => {
  try {
    const secret: Secret = process.env.JWT_SECRET as string;
    return jwt.verify(token, secret);
  } catch (err: unknown) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppError(HTTP_STATUS_CODES.UNAUTHORIZED, "Token expired");
    } else if (err instanceof jwt.JsonWebTokenError) {
      throw new AppError(HTTP_STATUS_CODES.UNAUTHORIZED, "Invalid token");
    } else {
      throw new AppError(
        HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        "Internal server error",
      );
    }
  }
};
