import {
  authenticateJWT,
  requireGlobalRole,
} from "@/middlewares/auth.middleware";
import { authController } from "../controllers/auth.controller";
import { validate } from "@/middlewares/validate.middleware";
import { authValidator } from "../validators/auth.validator";
import { asyncHandler } from "@/handlers/async.handler";
import { UserRole } from "../types/auth.types";
import express from "express";
const router = express.Router();

router.post(
  "/login",
  validate(authValidator.LoginSchema),
  asyncHandler(authController.login),
);

router.post(
  "/register",
  validate(authValidator.registerSchema),
  asyncHandler(authController.signUp),
);
router.post("/refreshToken", asyncHandler(authController.handleRefreshTokens));
router.get(
  "/get-all-users",
  authenticateJWT,
  requireGlobalRole(UserRole.ADMIN),
  asyncHandler(authController.getAllUsers),
);
router.get(
  "/users-for-invite",
  authenticateJWT,
  asyncHandler(authController.getUsersForInvite),
);

export const authRouter = router;
