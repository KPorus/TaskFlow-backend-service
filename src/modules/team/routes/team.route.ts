import { requireRole } from "@/middlewares/auth.middleware";
import { teamController } from "../controllers/team.controller";
import { asyncHandler } from "@/handlers/async.handler";
import express from "express";

const router = express.Router();

// Create team
router.post("/", asyncHandler(teamController.createTeam));

// List current user's teams
router.get("/", asyncHandler(teamController.getUserTeams));

// Add member
router.put(
  "/:teamId/add-member",
  requireRole(),
  asyncHandler(teamController.addMember),
);

// Remove member
router.put(
  "/remove-member",
  requireRole(),
  asyncHandler(teamController.removeMember),
);

// Delete team
router.delete(
  "/:teamId",
  requireRole(),
  asyncHandler(teamController.deleteTeam),
);

export const teamRouter = router;
