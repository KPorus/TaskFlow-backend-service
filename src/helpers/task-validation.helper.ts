import {
  TaskPriority,
  TaskStatus,
  Task,
} from "@/modules/task/models/task.model";
import { TaskDocument } from "@/modules/task/types/task.types";
import { HTTP_STATUS_CODES } from "@/utils/http-status-codes";
import { AppError } from "@/types/error.type";
import { Types } from "mongoose";

const startOfToday = (): Date => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export async function validateDuplicateTitle(
  projectId: Types.ObjectId | string,
  title: string,
  excludeTaskId?: Types.ObjectId | string,
): Promise<void> {
  const existing = await Task.findByTitleInProject(
    projectId,
    title,
    excludeTaskId,
  );
  if (existing) {
    throw new AppError(
      HTTP_STATUS_CODES.CONFLICT,
      "This task already exists in the project.",
    );
  }
}

export function validateDueDate(dueDate?: Date): void {
  if (!dueDate) return;
  if (dueDate < startOfToday()) {
    throw new AppError(
      HTTP_STATUS_CODES.BAD_REQUEST,
      "Please select a valid deadline.",
    );
  }
}

export function validateCompletedReassignment(
  existingTask: TaskDocument,
  updateData: Partial<TaskDocument>,
): void {
  if (
    existingTask.status === TaskStatus.DONE &&
    updateData.assignee != null &&
    String(updateData.assignee) !== String(existingTask.assignee ?? "")
  ) {
    throw new AppError(
      HTTP_STATUS_CODES.BAD_REQUEST,
      "Completed tasks cannot be reassigned.",
    );
  }
}

export async function validateTaskCreate(
  projectId: Types.ObjectId | string,
  data: { title?: string; dueDate?: Date },
): Promise<void> {
  if (data.title) {
    await validateDuplicateTitle(projectId, data.title);
  }
  validateDueDate(data.dueDate);
}

export async function validateTaskUpdate(
  existingTask: TaskDocument,
  updateData: Partial<TaskDocument>,
): Promise<void> {
  if (updateData.title) {
    await validateDuplicateTitle(
      existingTask.project,
      updateData.title,
      existingTask._id,
    );
  }
  validateDueDate(updateData.dueDate);
  validateCompletedReassignment(existingTask, updateData);
}

export { TaskPriority, TaskStatus };
