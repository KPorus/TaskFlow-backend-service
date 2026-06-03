import { ProjectDocument } from "@/modules/project/types/project.types";
import { Project } from "@/modules/project/models/project.model";
import { AuthUser } from "@/modules/auth/types/auth.types";
import { isAdmin } from "@/helpers/permission.helper";
import { Types } from "mongoose";

export type ProjectRoleOnProject = "OWNER" | "MEMBER" | "ADMIN";

export const getRoleOnProject = (
  project: { owner: Types.ObjectId | string | { toString(): string } },
  userId: Types.ObjectId | string,
): ProjectRoleOnProject => {
  const ownerId =
    project.owner instanceof Types.ObjectId
      ? project.owner.toString()
      : String(project.owner);
  return ownerId === String(userId) ? "OWNER" : "MEMBER";
};

export const getVisibleProjects = async (
  user: AuthUser,
): Promise<ProjectDocument[]> => {
  if (isAdmin(user)) {
    return Project.findAllProjects();
  }
  return Project.findVisibleProjects(user.id);
};

export const getVisibleProjectIds = async (
  user: AuthUser,
): Promise<Types.ObjectId[]> => {
  const projects = await getVisibleProjects(user);
  return projects.map((p) => p._id);
};

export const canAccessProject = async (
  user: AuthUser,
  projectId: Types.ObjectId | string,
): Promise<boolean> => {
  if (isAdmin(user)) return true;
  const project = await Project.findByProjectId(projectId);
  if (!project) return false;
  const userId = String(user.id);
  const isOwner = String(project.owner) === userId;
  const isMember = project.members.some((m) => String(m.user) === userId);
  return isOwner || isMember;
};
