import { notificationService } from "@/modules/notification/services/notification.service";
import { Project } from "@/modules/project/models/project.model";
import { Types } from "mongoose";

export type NotificationPayload = {
  type: string;
  message: string;
  link?: string;
};

export const projectLink = (projectId: Types.ObjectId | string) =>
  `/dashboard/projects/${String(projectId)}`;

export const getProjectOwnerId = async (
  projectId: Types.ObjectId | string,
): Promise<string | null> => {
  const project = await Project.findByProjectId(projectId);
  if (!project?.owner) return null;
  return String(project.owner);
};

export const notifyMany = async (
  userIds: (Types.ObjectId | string)[],
  payload: NotificationPayload,
  options?: { excludeUserId?: Types.ObjectId | string },
) => {
  const exclude = options?.excludeUserId
    ? String(options.excludeUserId)
    : undefined;
  const unique = [
    ...new Set(userIds.map((id) => String(id)).filter((id) => id !== exclude)),
  ];
  await Promise.all(
    unique.map((userId) => notificationService.notify(userId, payload)),
  );
};

export const notifyProjectOwner = async (
  projectId: Types.ObjectId | string,
  payload: NotificationPayload,
  actorId?: Types.ObjectId | string,
) => {
  const ownerId = await getProjectOwnerId(projectId);
  if (!ownerId) return;
  await notifyMany([ownerId], payload, { excludeUserId: actorId });
};

export const notifyTaskStakeholders = async (
  task: {
    project: Types.ObjectId | string;
    assignee?: Types.ObjectId | string | null;
  },
  payload: NotificationPayload,
  options?: {
    includeAssignee?: boolean;
    excludeUserId?: Types.ObjectId | string;
  },
) => {
  const recipients: string[] = [];
  const ownerId = await getProjectOwnerId(task.project);
  if (ownerId) recipients.push(ownerId);
  if (options?.includeAssignee && task.assignee) {
    recipients.push(String(task.assignee));
  }
  await notifyMany(recipients, payload, {
    excludeUserId: options?.excludeUserId,
  });
};
