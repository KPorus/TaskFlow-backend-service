import { requireRole } from "@/middlewares/auth.middleware";

import { taskController } from "../controllers/task.controller";
import { validate } from "@/middlewares/validate.middleware";
import { taskValidator } from "../validators/task.validator";
import { asyncHandler } from "@/handlers/async.handler";
import express from "express";

const router = express.Router();

router.post("/task-list", asyncHandler(taskController.getTaskList));

router.post(
  "/create-task/:teamId",
  validate(taskValidator.taskSchema),
  asyncHandler(taskController.createTask),
);

router.put("/assign-task", asyncHandler(taskController.assignTask));

router.delete(
  "/delete-task",
  requireRole(),
  asyncHandler(taskController.deleteTask),
);

router.put(
  "/update-task/:taskId",
  validate(taskValidator.taskSchema),
  asyncHandler(taskController.updateTask),
);

export const taskRouter = router;
