import { teamController } from "../controllers/team.controller";
import { requireRole } from "@/middlewares/auth.middleware";
import { asyncHandler } from "@/handlers/async.handler";
import express from "express";

const router = express.Router();

// Create team
router.post("/create", asyncHandler(teamController.createTeam));

// List current user's teams
router.get("/list", asyncHandler(teamController.getUserTeams));

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
  "/delete-team",
  requireRole(),
  asyncHandler(teamController.deleteTeam),
);

export const teamRouter = router;
