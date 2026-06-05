import {
  notifyTaskStakeholders,
  projectLink,
} from "@/helpers/notification-recipients.helper";
import { ActivityType } from "@/modules/activity/types/activity.types";
import { isAdmin, isProjectOwner } from "@/helpers/permission.helper";
import { canAccessProject } from "@/helpers/project-access.helper";
import { Project } from "@/modules/project/models/project.model";
import { HTTP_STATUS_CODES } from "@/utils/http-status-codes";
import { AuthUser } from "@/modules/auth/types/auth.types";
import { Task } from "@/modules/task/models/task.model";
import { logActivity } from "@/helpers/activity.helper";
import { Comment } from "../models/comment.model";
import { AppError } from "@/types/error.type";
import { Types } from "mongoose";
import { io } from "@/server";

const assertTaskAccess = async (
  user: AuthUser,
  taskId: Types.ObjectId | string,
) => {
  const task = await Task.findById(taskId);
  if (!task?.project) {
    throw new AppError(HTTP_STATUS_CODES.NOT_FOUND, "Task not found");
  }
  const allowed = await canAccessProject(user, task.project);
  if (!allowed) {
    throw new AppError(HTTP_STATUS_CODES.FORBIDDEN, "Forbidden");
  }
  return task;
};

const createComment = async (
  taskId: Types.ObjectId | string,
  authorId: Types.ObjectId | string,
  text: string,
  user?: AuthUser,
) => {
  const task = user
    ? await assertTaskAccess(user, taskId)
    : await Task.findById(taskId);
  if (!task) {
    throw new AppError(HTTP_STATUS_CODES.NOT_FOUND, "Task not found");
  }

  const comment = await Comment.createComment({
    task: typeof taskId === "string" ? new Types.ObjectId(taskId) : taskId,
    author:
      typeof authorId === "string" ? new Types.ObjectId(authorId) : authorId,
    text,
  });

  const populated = await Comment.findById(comment._id).populate(
    "author",
    "name email",
  );

  io.to(String(task.project)).emit("commentAdded", populated);

  await logActivity({
    type: ActivityType.COMMENT_ADDED,
    message: `Comment added on task "${task.title}"`,
    actor: authorId,
    project: task.project,
    task: task._id,
  });

  await notifyTaskStakeholders(
    task,
    {
      type: "COMMENT_ADDED",
      message: `New comment on task "${task.title}"`,
      link: projectLink(task.project!),
    },
    { includeAssignee: true, excludeUserId: authorId },
  );

  return {
    message: "Comment created",
    comment: populated,
  };
};

const getByTask = async (taskId: Types.ObjectId | string, user?: AuthUser) => {
  if (user) {
    await assertTaskAccess(user, taskId);
  }
  const comments = await Comment.findByTask(taskId);
  return {
    message: "Comments fetched",
    comments,
  };
};

const deleteComment = async (
  commentId: Types.ObjectId | string,
  user: AuthUser,
) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError(HTTP_STATUS_CODES.NOT_FOUND, "Comment not found");
  }

  const task = await Task.findById(comment.task);
  if (!task?.project) {
    throw new AppError(HTTP_STATUS_CODES.NOT_FOUND, "Task not found");
  }

  const project = await Project.findByProjectId(task.project);
  if (!project) {
    throw new AppError(HTTP_STATUS_CODES.NOT_FOUND, "Project not found");
  }

  const isAuthor = String(comment.author) === String(user.id);
  const canDelete =
    isAuthor || isAdmin(user) || isProjectOwner(project, user.id);

  if (!canDelete) {
    throw new AppError(HTTP_STATUS_CODES.FORBIDDEN, "Forbidden");
  }

  const commentTaskId = comment.task;
  await Comment.deleteComment(commentId);

  io.to(String(task.project)).emit("commentDeleted", {
    commentId: String(commentId),
    taskId: String(commentTaskId),
  });

  return { message: "Comment deleted" };
};

export const commentService = {
  createComment,
  getByTask,
  deleteComment,
};
