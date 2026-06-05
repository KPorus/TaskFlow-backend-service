import { TLoginInput, TRegisterInput } from "../validators/auth.validator";

import { hashPassword, validatePassword } from "@/helpers/auth.helper";

import { generateToken, verifyToken } from "@/utils/token.util";

import { HTTP_STATUS_CODES } from "@utils/http-status-codes";

import { UserRole, normalizeUserRole } from "../types/auth.types";

import { AppError } from "@/types/error.type";

import { User } from "../models/auth.model";

import { Types } from "mongoose";

const register = async (data: TRegisterInput) => {
  const hashedPassword = await hashPassword(data.password);

  const user = await User.createUser({
    name: data.name,

    email: data.email,

    password: hashedPassword,

    role: UserRole.USER,
  });

  const profile = {
    id: user._id,
    email: user.email,
    name: user.name,
    role: normalizeUserRole(user.role),
  };

  const token = generateToken({
    id: user._id,
    email: user.email,
    role: profile.role,
  });

  return {
    message: `${user.name} Signup successful`,
    accessToken: token.acessToken,
    refreshToken: token.refreshToken,
    user: profile,
  };
};

const login = async (data: TLoginInput) => {
  const existing = await User.findByEmail(data.email);

  if (!existing) {
    throw new AppError(HTTP_STATUS_CODES.UNAUTHORIZED, "Invalid email");
  }

  const isPasswordValid = await validatePassword(
    data.password,

    existing.password,
  );

  if (!isPasswordValid) {
    throw new AppError(HTTP_STATUS_CODES.UNAUTHORIZED, "Invalid password");
  }

  const token = generateToken({
    id: existing._id,

    email: existing.email,

    role: normalizeUserRole(existing.role),
  });

  return {
    message: `${existing.name} Login successful`,

    accessToken: token.acessToken,

    refreshToken: token.refreshToken,

    user: {
      id: existing._id,

      email: existing.email,

      name: existing.name,

      role: normalizeUserRole(existing.role),
    },
  };
};

const refreshTokens = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new AppError(
      HTTP_STATUS_CODES.UNAUTHORIZED,

      "Refresh token is missing",
    );
  }

  const payload = verifyToken(refreshToken) as {
    id: string;

    email: string;

    role: UserRole;
  };

  if (!payload) {
    throw new AppError(HTTP_STATUS_CODES.UNAUTHORIZED, "Invalid refresh token");
  }

  const user = await User.findByEmail(payload.email);

  if (!user) {
    throw new AppError(HTTP_STATUS_CODES.UNAUTHORIZED, "User no longer exists");
  }

  const tokens = generateToken({
    id: user._id,

    email: user.email,

    role: normalizeUserRole(user.role),
  });

  return {
    accessToken: tokens.acessToken,

    refreshToken: tokens.refreshToken,
  };
};

const getAllUsers = async (userId: Types.ObjectId | string) => {
  const users = await User.findAllUser(new Types.ObjectId(userId));

  return {
    messages: "Users found",

    users: users ?? [],
  };
};

const getUsersForInvite = async (userId: Types.ObjectId | string) => {
  const users = await User.findAllUser(new Types.ObjectId(userId));
  return {
    messages: "Users found",
    users: users ?? [],
  };
};

export const authService = {
  login,

  register,

  refreshTokens,

  getAllUsers,

  getUsersForInvite,
};
