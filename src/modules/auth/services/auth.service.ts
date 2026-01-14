import { TLoginInput, TRegisterInput } from "../validators/auth.validator";
import { hashPassword, validatePassword } from "@/helpers/auth.helper";
import { generateToken, verifyToken } from "@/utils/token.util";
import { HTTP_STATUS_CODES } from "@utils/http-status-codes";
import { AppError } from "@/types/error.type";
import { User } from "../models/auth.model";

/**
 * Register service =====================================
 */
const register = async (data: TRegisterInput) => {
  const hashedPassword = await hashPassword(data.password);
  const user = await User.createUser({
    name: data.name,
    email: data.email,
    password: hashedPassword,
  });
  // console.log(user);
  return {
    message: `${user.name} Signup successful`,
    user: {
      id: user._id,
      email: user.email,
    },
  };
};

/**
 * Login service =====================================
 */

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
  });

  return {
    message: `${existing.name} Login successful`,
    accessToken: token.acessToken,
    refreshToken: token.refreshToken,
    user: {
      id: existing._id,
      email: existing.email,
    },
  };
};

/**
 * Refresh Token =====================================
 */
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
  });

  return {
    accessToken: tokens.acessToken,
    refreshToken: tokens.refreshToken,
  };
};

export const authService = {
  login,
  register,
  refreshTokens,
};
