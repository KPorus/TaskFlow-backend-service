import { projectController } from "../controllers/project.controller";
import { requireProjectAccess } from "@/middlewares/auth.middleware";
import { projectValidator } from "../validators/project.validator";
import { validate } from "@/middlewares/validate.middleware";
import { asyncHandler } from "@/handlers/async.handler";
import express from "express";

const router = express.Router();

router.post(
  "/create",
  validate(projectValidator.createProjectSchema),
  asyncHandler(projectController.createProject),
);

router.get("/list", asyncHandler(projectController.getUserProjects));

router.put(
  "/update/:projectId",
  requireProjectAccess("manage"),
  validate(projectValidator.updateProjectSchema),
  asyncHandler(projectController.updateProject),
);

router.put(
  "/:projectId/add-member",
  requireProjectAccess("manage"),
  asyncHandler(projectController.addMember),
);

router.put(
  "/remove-member",
  requireProjectAccess("manage"),
  asyncHandler(projectController.removeMember),
);

router.delete(
  "/delete-project",
  requireProjectAccess("manage"),
  asyncHandler(projectController.deleteProject),
);

export const projectRouter = router;
