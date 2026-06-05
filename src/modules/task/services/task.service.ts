import {
  notifyMany,
  notifyProjectOwner,
  notifyTaskStakeholders,
  projectLink,
} from "@/helpers/notification-recipients.helper";
import {
  validateTaskCreate,
  validateTaskUpdate,
  validateCompletedReassignment,
} from "@/helpers/task-validation.helper";
import {
  canDeleteTask,
  canUpdateTask,
  checkProjectAccess,
} from "@/helpers/permission.helper";
import { ActivityType } from "@/modules/activity/types/activity.types";
import { canAccessProject } from "@/helpers/project-access.helper";
import { Project } from "@/modules/project/models/project.model";
import { Comment } from "@/modules/comment/models/comment.model";
import { HTTP_STATUS_CODES } from "@/utils/http-status-codes";
import { AuthUser } from "@/modules/auth/types/auth.types";
import { ITask, TaskListQuery } from "../types/task.types";
import { User } from "@/modules/auth/models/auth.model";
import { logActivity } from "@/helpers/activity.helper";
import { Task, TaskStatus } from "../models/task.model";
import { AppError } from "@/types/error.type";
import { Types } from "mongoose";
import mongoose from "mongoose";
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

  if (actor) {
    const allowed = await checkProjectAccess(
      actor,
      data.project!,
      "create_task",
    );
    if (!allowed) {
      throw new AppError(HTTP_STATUS_CODES.FORBIDDEN, "Forbidden");
    }
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
    const link = projectLink(task.project!);
    const assigneeUser = await User.findById(task.assignee);
    await notifyMany(
      [task.assignee],
      {
        type: "TASK_ASSIGNED",
        message: `Task "${task.title}" assigned to you`,
        link,
      },
      { excludeUserId: actor?.id },
    );
    await notifyProjectOwner(
      task.project!,
      {
        type: "TASK_ASSIGNED",
        message: `Task "${task.title}" assigned to ${assigneeUser?.name ?? "a member"}`,
        link,
      },
      actor?.id,
    );
  }

  return {
    message: "Task created successfully",
    task,
  };
};

const getTaskList = async (query: TaskListQuery, actor?: AuthUser) => {
  const { projectId, ...filters } = query;
  if (actor) {
    const allowed = await canAccessProject(actor, projectId);
    if (!allowed) {
      throw new AppError(HTTP_STATUS_CODES.FORBIDDEN, "Forbidden");
    }
  }
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
  projectId: Types.ObjectId | string,
  actor?: AuthUser,
) => {
  const existing = await Task.findById(taskId);
  if (!existing) {
    throw new AppError(HTTP_STATUS_CODES.NOT_FOUND, "Task not found");
  }
  if (String(existing.project) !== String(projectId)) {
    throw new AppError(HTTP_STATUS_CODES.BAD_REQUEST, "Task not in project");
  }
  if (actor) {
    const allowed = await canAccessProject(actor, projectId);
    if (!allowed) {
      throw new AppError(HTTP_STATUS_CODES.FORBIDDEN, "Forbidden");
    }
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

  const link = projectLink(tasks.project!);
  await notifyMany(
    [userId],
    {
      type: "TASK_ASSIGNED",
      message: `Task "${tasks.title}" assigned to you`,
      link,
    },
    { excludeUserId: actor?.id },
  );
  await notifyProjectOwner(
    tasks.project!,
    {
      type: "TASK_ASSIGNED",
      message: `Task "${tasks.title}" assigned to ${assignee?.name ?? "a member"}`,
      link,
    },
    actor?.id,
  );

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
  if (!task.project.equals(projectId)) {
    throw new AppError(HTTP_STATUS_CODES.NOT_FOUND, "Task not found");
  }
  const allowed = await canDeleteTask(user, task);
  if (!allowed) {
    throw new AppError(HTTP_STATUS_CODES.FORBIDDEN, "Forbidden");
  }

  const session = await mongoose.startSession();
  let deletedCommentsCount = 0;

  try {
    await session.withTransaction(async () => {
      const commentResult = await Comment.deleteManyById(id, { session });
      deletedCommentsCount = commentResult.deletedCount ?? 0;

      const taskResult = await Task.deleteOne(
        { _id: id, project: projectId },
        { session },
      );
      if (taskResult.deletedCount === 0) {
        throw new AppError(HTTP_STATUS_CODES.NOT_FOUND, "Task not found");
      }
    });
  } finally {
    await session.endSession();
  }

  io.to(String(task.project)).emit("taskDelete", task);

  return {
    message: "Task Deleted Successfully",
    task,
    deletedCommentsCount,
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

  let updated_task;
  if ("assignee" in updateData && updateData.assignee == null) {
    const { assignee: _assignee, ...rest } = updateData;
    updated_task = await Task.findByIdAndUpdate(
      taskId,
      { $unset: { assignee: 1 }, ...rest },
      { new: true },
    );
  } else {
    updated_task = await Task.updateTask(
      new Types.ObjectId(taskId),
      updateData,
    );
  }
  if (updated_task?.project) {
    io.to(String(updated_task.project)).emit("taskUpdate", updated_task);
  }

  const link = projectLink(updated_task?.project ?? existing.project);

  if (
    updateData.assignee != null &&
    String(updateData.assignee) !== String(existing.assignee ?? "")
  ) {
    const newAssignee = await User.findById(updateData.assignee);
    await notifyMany(
      [updateData.assignee],
      {
        type: "TASK_ASSIGNED",
        message: `Task "${updated_task?.title ?? existing.title}" assigned to you`,
        link,
      },
      { excludeUserId: user.id },
    );
    await notifyProjectOwner(
      existing.project,
      {
        type: "TASK_ASSIGNED",
        message: `Task "${updated_task?.title ?? existing.title}" assigned to ${newAssignee?.name ?? "a member"}`,
        link,
      },
      user.id,
    );
  }

  if (updateData.status != null && updateData.status !== existing.status) {
    await notifyTaskStakeholders(
      existing,
      {
        type: "TASK_UPDATED",
        message: `Task "${updated_task?.title ?? existing.title}" status changed to ${updateData.status}`,
        link,
      },
      { includeAssignee: false, excludeUserId: user.id },
    );
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
