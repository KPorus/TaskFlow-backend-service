import { notificationService } from "@/modules/notification/services/notification.service";
import { isAdmin, isProjectManager } from "@/helpers/permission.helper";
import { ActivityType } from "@/modules/activity/types/activity.types";
import { AuthUser, UserRole } from "@/modules/auth/types/auth.types";
import { HTTP_STATUS_CODES } from "@/utils/http-status-codes";
import { Task } from "@/modules/task/models/task.model";
import { logActivity } from "@/helpers/activity.helper";
import { Comment } from "../models/comment.model";
import { AppError } from "@/types/error.type";
import { Types } from "mongoose";
import { io } from "@/server";

const createComment = async (
  taskId: Types.ObjectId | string,
  authorId: Types.ObjectId | string,
  text: string,
) => {
  const task = await Task.findById(taskId);
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

  if (task.assignee && String(task.assignee) !== String(authorId)) {
    await notificationService.notify(String(task.assignee), {
      type: "COMMENT_ADDED",
      message: `New comment on task "${task.title}"`,
      link: `/dashboard/projects/${task.project}`,
    });
  }

  return {
    message: "Comment created",
    comment: populated,
  };
};

const getByTask = async (taskId: Types.ObjectId | string) => {
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

  const isAuthor = String(comment.author) === String(user.id);
  const canDelete =
    isAuthor ||
    isAdmin(user) ||
    (isProjectManager(user) && user.role === UserRole.PROJECT_MANAGER);

  if (!canDelete) {
    throw new AppError(HTTP_STATUS_CODES.FORBIDDEN, "Forbidden");
  }

  await Comment.deleteComment(commentId);
  return { message: "Comment deleted" };
};

export const commentService = {
  createComment,
  getByTask,
  deleteComment,
};
