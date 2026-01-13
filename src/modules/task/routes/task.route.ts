import { requireRole } from "@/middlewares/auth.middleware";

import { taskController } from "../controllers/task.controller";
import { taskValidator } from "../validators/task.validator";
import { validate } from "@/middlewares/validate.middleware";
import { asyncHandler } from "@/handlers/async.handler";
import express from "express";

const router = express.Router();

router.get("/task-list", asyncHandler(taskController.getTaskList));

router.post(
  "/create-task/:teamId",
  validate(taskValidator.taskSchema),
  asyncHandler(taskController.createTask),
);

router.get("/assign-task", asyncHandler(taskController.assignTask));

router.delete(
  "/delete-task",
  requireRole(),
  asyncHandler(taskController.deleteTask),
);

router.put(
  "/update-task/:teamId",
  validate(taskValidator.taskSchema),
  asyncHandler(taskController.updateTask),
);

export const taskRouter = router;
