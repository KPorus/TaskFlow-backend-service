import { AuthUser, normalizeUserRole } from "@/modules/auth/types/auth.types";
import jwt from "jsonwebtoken";

export const verifySocketToken = (token?: string): AuthUser | null => {
  if (!token) return null;

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as AuthUser;

    return {
      ...decoded,
      id: String(decoded.id),
      role: normalizeUserRole(decoded.role),
    };
  } catch {
    return null;
  }
};
