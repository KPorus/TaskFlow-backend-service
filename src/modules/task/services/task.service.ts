import {
  validateTaskCreate,
  validateTaskUpdate,
  validateCompletedReassignment,
} from "@/helpers/task-validation.helper";
import { notificationService } from "@/modules/notification/services/notification.service";
import { canDeleteTask, canUpdateTask } from "@/helpers/permission.helper";
import { ActivityType } from "@/modules/activity/types/activity.types";
import { Project } from "@/modules/project/models/project.model";
import { HTTP_STATUS_CODES } from "@/utils/http-status-codes";
import { AuthUser } from "@/modules/auth/types/auth.types";
import { ITask, TaskListQuery } from "../types/task.types";
import { User } from "@/modules/auth/models/auth.model";
import { logActivity } from "@/helpers/activity.helper";
import { Task, TaskStatus } from "../models/task.model";
import { AppError } from "@/types/error.type";
import { Types } from "mongoose";
import { io } from "@/server";

const createTask = async (data: Partial<ITask>, actor?: AuthUser) => {
  if (data.assignee) {
    const user = await User.findById(data.assignee);
    if (!user) {
      throw new AppError(HTTP_STATUS_CODES.NOT_FOUND, "No User found for task");
    }
  }
  const project = await Project.findById(data.project);
  if (!project) {
    throw new AppError(HTTP_STATUS_CODES.NOT_FOUND, "Project not found");
  }

  await validateTaskCreate(data.project!, {
    title: data.title,
    dueDate: data.dueDate,
  });

  const task = await Task.createTask(data);

  if (task.project) {
    io.to(String(task.project)).emit("taskCreated", task);
  }

  if (actor) {
    await logActivity({
      type: ActivityType.TASK_CREATED,
      message: `Task "${task.title}" created`,
      actor: actor.id,
      project: task.project,
      task: task._id,
    });
  }

  if (task.assignee) {
    await notificationService.notify(String(task.assignee), {
      type: "TASK_ASSIGNED",
      message: `Task "${task.title}" assigned to you`,
      link: `/dashboard/projects/${task.project}`,
    });
  }

  return {
    message: "Task created successfully",
    task,
  };
};

const getTaskList = async (query: TaskListQuery) => {
  const { projectId, ...filters } = query;
  const { tasks, total } = await Task.findTaskList(projectId, filters);
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  return {
    message: "Task list fetched successfully",
    tasks,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
};

const assignTask = async (
  userId: Types.ObjectId | string,
  taskId: Types.ObjectId | string,
  actor?: AuthUser,
) => {
  const existing = await Task.findById(taskId);
  if (!existing) {
    throw new AppError(HTTP_STATUS_CODES.NOT_FOUND, "Task not found");
  }
  validateCompletedReassignment(existing, {
    assignee: new Types.ObjectId(userId),
  });

  const tasks = await Task.assignTask(
    new Types.ObjectId(userId),
    new Types.ObjectId(taskId),
  );
  if (!tasks) {
    throw new AppError(HTTP_STATUS_CODES.NOT_FOUND, "No tasks found for user");
  }
  if (tasks?.project) {
    io.to(String(tasks.project)).emit("taskAssign", tasks);
  }

  const assignee = await User.findById(userId);
  if (actor) {
    await logActivity({
      type: ActivityType.TASK_ASSIGNED,
      message: `Task "${tasks.title}" assigned to ${assignee?.name ?? "member"}`,
      actor: actor.id,
      project: tasks.project,
      task: tasks._id,
    });
  }

  await notificationService.notify(String(userId), {
    type: "TASK_ASSIGNED",
    message: `Task "${tasks.title}" assigned to you`,
    link: `/dashboard/projects/${tasks.project}`,
  });

  return {
    message: "Task assigned successfully",
    tasks,
  };
};

const deleteTask = async (
  id: Types.ObjectId | string,
  projectId: Types.ObjectId | string,
  user: AuthUser,
) => {
  const task = await Task.findById(id);
  if (!task) {
    throw new AppError(HTTP_STATUS_CODES.NOT_FOUND, "Task not found");
  }
  const allowed = await canDeleteTask(user, task);
  if (!allowed) {
    throw new AppError(HTTP_STATUS_CODES.FORBIDDEN, "Forbidden");
  }

  const deleted_task = await Task.deleteTask(
    new Types.ObjectId(id),
    new Types.ObjectId(projectId),
  );
  if (deleted_task?.project) {
    io.to(String(deleted_task.project)).emit("taskDelete", deleted_task);
  }
  return {
    message: "Task Deleted Successfully",
    task: deleted_task,
  };
};

const updateTask = async (
  taskId: Types.ObjectId | string,
  updateData: Partial<ITask>,
  user: AuthUser,
) => {
  const existing = await Task.findById(taskId);
  if (!existing) {
    throw new AppError(HTTP_STATUS_CODES.NOT_FOUND, "Task not found");
  }

  const allowed = await canUpdateTask(user, existing);
  if (!allowed) {
    throw new AppError(HTTP_STATUS_CODES.FORBIDDEN, "Forbidden");
  }

  await validateTaskUpdate(existing, updateData);

  const updated_task = await Task.updateTask(
    new Types.ObjectId(taskId),
    updateData,
  );
  if (updated_task?.project) {
    io.to(String(updated_task.project)).emit("taskUpdate", updated_task);
  }

  if (updateData.status === TaskStatus.DONE) {
    await logActivity({
      type: ActivityType.TASK_COMPLETED,
      message: `Task "${updated_task?.title}" marked as Completed`,
      actor: user.id,
      project: updated_task?.project,
      task: updated_task?._id,
    });
  }

  return {
    message: "Task Updated Successfully",
    task: updated_task,
  };
};

export const taskService = {
  createTask,
  getTaskList,
  assignTask,
  deleteTask,
  updateTask,
};
