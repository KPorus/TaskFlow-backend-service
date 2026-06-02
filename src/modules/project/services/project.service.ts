import { isAdmin, isProjectManager } from "@/helpers/permission.helper";
import { ActivityType } from "@/modules/activity/types/activity.types";
import { HTTP_STATUS_CODES } from "@/utils/http-status-codes";
import { AuthUser } from "@/modules/auth/types/auth.types";
import { logActivity } from "@/helpers/activity.helper";
import { ProjectStatus } from "../types/project.types";
import { Project } from "../models/project.model";
import { AppError } from "@/types/error.type";
import { Types } from "mongoose";
import { io } from "@/server";

const createProject = async (
  data: {
    name: string;
    description?: string;
    deadline?: Date;
    status?: ProjectStatus;
    owner: Types.ObjectId | string;
  },
  actor?: AuthUser,
) => {
  if (actor && !isAdmin(actor) && !isProjectManager(actor)) {
    throw new AppError(
      HTTP_STATUS_CODES.FORBIDDEN,
      "Only admins and project managers can create projects",
    );
  }

  const project = await Project.createProject({
    name: data.name,
    description: data.description,
    deadline: data.deadline,
    status: data.status,
    owner:
      typeof data.owner === "string"
        ? new Types.ObjectId(data.owner)
        : data.owner,
  });
  if (actor) {
    await logActivity({
      type: ActivityType.PROJECT_CREATED,
      message: `Project "${project.name}" created`,
      actor: actor.id,
      project: project._id,
    });
  }

  return {
    message: "Project created successfully",
    project,
  };
};

const getUserProjects = async (
  userId: Types.ObjectId | string,
  filters?: { status?: ProjectStatus; search?: string },
) => {
  let projects = await Project.findMemberProjects(userId);
  if (!projects || projects.length === 0) {
    return { message: "User projects fetched successfully", projects: [] };
  }
  if (filters?.status) {
    projects = projects.filter((p) => p.status === filters.status);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    projects = projects.filter((p) => p.name.toLowerCase().includes(q));
  }
  return {
    message: "User projects fetched successfully",
    projects,
  };
};

const updateProject = async (
  projectId: Types.ObjectId | string,
  data: {
    name?: string;
    description?: string;
    deadline?: Date;
    status?: ProjectStatus;
  },
) => {
  const project = await Project.updateProject(projectId, data);
  if (!project) {
    throw new AppError(HTTP_STATUS_CODES.NOT_FOUND, "Project not found");
  }
  io.to(String(project._id)).emit("projectUpdated", project);
  return {
    message: "Project updated successfully",
    project,
  };
};

const addMember = async (
  projectId: Types.ObjectId | string,
  member: { user: Types.ObjectId | string },
  actor?: AuthUser,
) => {
  const project = await Project.addMember(projectId, member);
  if (project?._id) {
    io.to(String(project._id)).emit("projectMemberAdd", project);
  }

  if (actor) {
    await logActivity({
      type: ActivityType.MEMBER_ADDED,
      message: `Member added to "${project?.name}"`,
      actor: actor.id,
      project: projectId,
    });
  }

  return {
    message: "Member added successfully",
    project,
  };
};

const removeMember = async (
  projectId: Types.ObjectId | string,
  memberId: Types.ObjectId | string,
) => {
  const project = await Project.removeMember(projectId, memberId);
  if (project?._id) {
    io.to(String(project._id)).emit("projectMemberRemove", project);
  }
  return {
    message: "Member removed successfully",
    project,
  };
};

const deleteProject = async (id: string) => {
  const result = await Project.deleteProject(new Types.ObjectId(id));
  if (result.deletedCount && result.deletedCount > 0) {
    io.to(id).emit("projectDeleted", { projectId: id });
  }
  return {
    message: "Project deleted successfully",
    result,
  };
};

export const projectService = {
  createProject,
  getUserProjects,
  updateProject,
  addMember,
  removeMember,
  deleteProject,
};
