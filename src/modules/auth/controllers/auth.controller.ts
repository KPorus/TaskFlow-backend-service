import { clearCookieAndHeader, setCookie } from "@/utils/cookie.util";
import { HTTP_STATUS_CODES } from "@utils/http-status-codes";
import { sendResponse } from "@/handlers/response.handler";
import { issueSession } from "../helpers/session.helper";
import { authService } from "../services/auth.service";
import { AuthRequest } from "../types/auth.types";
import { Request, Response } from "express";

const signUp = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  const { accessToken, refreshToken, user } = await authService.register({
    email,
    password,
    name,
  });

  issueSession(res, { accessToken, refreshToken });
  sendResponse(res, user, HTTP_STATUS_CODES.CREATED, "Signup successful!");
};

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { accessToken, refreshToken, user } = await authService.login({
    email,
    password,
  });

  issueSession(res, { accessToken, refreshToken });
  sendResponse(res, user, HTTP_STATUS_CODES.OK, "Login successful!");
};

const logout = async (_: Request, res: Response) => {
  clearCookieAndHeader(res);
  sendResponse(res, null, HTTP_STATUS_CODES.OK, "Logout successful!");
};

const handleRefreshTokens = async (req: Request, res: Response) => {
  const prevRefreshToken = req.cookies.refreshToken;
  const { accessToken, refreshToken } =
    await authService.refreshTokens(prevRefreshToken);
  setCookie(res, "refreshToken", refreshToken);
  res.setHeader("Access-Control-Expose-Headers", "Authorization");
  res.setHeader("Authorization", `Bearer ${accessToken}`);

  sendResponse(
    res,
    accessToken,
    HTTP_STATUS_CODES.OK,
    "Tokens refreshed successfully!",
  );
};

const getAllUsers = async (req: AuthRequest, res: Response) => {
  const id = req.user?.id.toString();
  const users = await authService.getAllUsers(id as string);
  sendResponse(res, users.users, HTTP_STATUS_CODES.OK, users.messages);
};

const getUsersForInvite = async (req: AuthRequest, res: Response) => {
  const id = req.user?.id.toString();
  const users = await authService.getUsersForInvite(id as string);
  sendResponse(res, users.users, HTTP_STATUS_CODES.OK, users.messages);
};

export const authController = {
  signUp,
  login,
  logout,
  handleRefreshTokens,
  getAllUsers,
  getUsersForInvite,
};
