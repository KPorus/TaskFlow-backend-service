import { setCookie } from "@/utils/cookie.util";
import { Response } from "express";

export const issueSession = (
  res: Response,
  session: { accessToken: string; refreshToken: string },
) => {
  setCookie(res, "refreshToken", session.refreshToken);
  res.setHeader("Access-Control-Expose-Headers", "Authorization");
  res.setHeader("Authorization", `Bearer ${session.accessToken}`);
};
