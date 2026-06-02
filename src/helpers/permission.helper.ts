import { Project } from "@/modules/project/models/project.model";
import { UserRole } from "@/modules/auth/types/auth.types";
import { AuthUser } from "@/modules/auth/types/auth.types";
import { Types } from "mongoose";

export type ProjectAction =
  | "manage"
  | "create_task"
  | "delete_task"
  | "assign_task"
  | "update_task";

export const isAdmin = (user?: AuthUser): boolean =>
  user?.role === UserRole.ADMIN;

export const isProjectManager = (user?: AuthUser): boolean =>
  user?.role === UserRole.PROJECT_MANAGER;

export const isTeamMember = (user?: AuthUser): boolean =>
  user?.role === UserRole.TEAM_MEMBER;

export const isProjectOwner = (
  project: { owner: Types.ObjectId | string | { toString(): string } },
  userId: Types.ObjectId | string,
): boolean => {
  const ownerId =
    project.owner instanceof Types.ObjectId
      ? project.owner.toString()
      : String(project.owner);
  return ownerId === String(userId);
};

export const isProjectMember = (
  project: { members: { user: Types.ObjectId | string }[] },
  userId: Types.ObjectId | string,
): boolean => project.members.some((m) => String(m.user) === String(userId));

export async function checkProjectAccess(
  user: AuthUser,
  projectId: Types.ObjectId | string,
  action: ProjectAction,
): Promise<boolean> {
  if (isAdmin(user)) return true;

  const project = await Project.findByProjectId(projectId);
  if (!project) return false;

  const userId = user.id;
  const member = isProjectMember(project, userId);
  const owner = isProjectOwner(project, userId);

  switch (action) {
    case "manage":
      return isProjectManager(user) && (owner || member);
    case "create_task":
    case "delete_task":
      return isProjectManager(user) && (owner || member);
    case "assign_task":
      return (
        (isProjectManager(user) && (owner || member)) ||
        (isTeamMember(user) && member)
      );
    case "update_task":
      return member || owner;
    default:
      return false;
  }
}

export async function canUpdateTask(
  user: AuthUser,
  task: {
    assignee?: Types.ObjectId | string;
    project: Types.ObjectId | string;
    creator: Types.ObjectId | string;
  },
): Promise<boolean> {
  if (isAdmin(user)) return true;

  const project = await Project.findByProjectId(task.project);
  if (!project) return false;

  if (isProjectManager(user) && isProjectMember(project, user.id)) return true;

  if (isTeamMember(user)) {
    return task.assignee != null && String(task.assignee) === String(user.id);
  }

  return false;
}

export async function canDeleteTask(
  user: AuthUser,
  task: { project: Types.ObjectId | string },
): Promise<boolean> {
  if (isAdmin(user)) return true;
  if (isTeamMember(user)) return false;

  const project = await Project.findByProjectId(task.project);
  if (!project) return false;

  return (
    isProjectManager(user) &&
    (isProjectOwner(project, user.id) || isProjectMember(project, user.id))
  );
}
