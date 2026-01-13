import { requireRole } from "@/middlewares/auth.middleware";

import {
  createTaskSchema,
  updateTaskSchema,
} from "../validators/task.validator";
import { taskController } from "../controllers/task.controller";
import { validate } from "@/middlewares/validate.middleware";
import { asyncHandler } from "@/handlers/async.handler";
import express from "express";

const router = express.Router();

router.get("/task-list", asyncHandler(taskController.getTaskList));

router.post(
  "/create-task",
  validate(createTaskSchema),
  asyncHandler(taskController.createTask),
);

router.get("/assign-task", asyncHandler(taskController.assignTask));

router.delete(
  "/delete-task",
  requireRole(),
  asyncHandler(taskController.deleteTask),
);

router.put(
  "/update-task",
  validate(updateTaskSchema),
  asyncHandler(taskController.updateTask),
);

export const taskRouter = router;
