import {
  TCreateProjectInput,
  TUpdateProjectInput,
} from "../validators/project.validator";
import { AuthRequest } from "@/modules/auth/types/auth.types";
import { HTTP_STATUS_CODES } from "@/utils/http-status-codes";
import { projectService } from "../services/project.service";
import { sendResponse } from "@/handlers/response.handler";
import { ProjectStatus } from "../types/project.types";
import { Request, Response } from "express";
import { Types } from "mongoose";

const createProject = async (req: AuthRequest, res: Response) => {
  const { name, description, deadline, status } =
    req.body as TCreateProjectInput;
  const result = await projectService.createProject(
    {
      name,
      description,
      deadline: deadline ? new Date(deadline) : undefined,
      status,
      owner: req.user!.id,
    },
    req.user,
  );
  sendResponse(
    res,
    result,
    HTTP_STATUS_CODES.CREATED,
    "Project Created Successfully",
  );
};

const getUserProjects = async (req: AuthRequest, res: Response) => {
  const status = req.query.status as ProjectStatus | undefined;
  const search = req.query.search as string | undefined;
  const result = await projectService.getUserProjects(req.user!, {
    status,
    search,
  });
  sendResponse(
    res,
    result,
    HTTP_STATUS_CODES.OK,
    "User Projects Fetched Successfully",
  );
};

const updateProject = async (req: AuthRequest, res: Response) => {
  const { projectId } = req.params as { projectId: string };
  const { name, description, deadline, status } =
    req.body as TUpdateProjectInput;
  const result = await projectService.updateProject(projectId, {
    name,
    description,
    deadline: deadline ? new Date(deadline) : undefined,
    status,
  });
  sendResponse(
    res,
    result,
    HTTP_STATUS_CODES.OK,
    "Project Updated Successfully",
  );
};

const addMember = async (req: AuthRequest, res: Response) => {
  const { projectId } = req.params as { projectId: string };
  const { user } = req.body;
  const result = await projectService.addMember(
    new Types.ObjectId(projectId),
    { user },
    req.user,
  );
  sendResponse(
    res,
    result,
    HTTP_STATUS_CODES.OK,
    "Member Added to Project Successfully",
  );
};

const removeMember = async (req: AuthRequest, res: Response) => {
  const { projectId, memberId } = req.body;
  const result = await projectService.removeMember(
    projectId,
    memberId,
    req.user,
  );
  sendResponse(
    res,
    result,
    HTTP_STATUS_CODES.OK,
    "Member Removed from Project Successfully",
  );
};

const deleteProject = async (req: Request, res: Response) => {
  const { projectId } = req.body as { projectId: string };
  const result = await projectService.deleteProject(projectId);
  sendResponse(
    res,
    result,
    HTTP_STATUS_CODES.OK,
    "Project Deleted Successfully",
  );
};

export const projectController = {
  createProject,
  getUserProjects,
  updateProject,
  addMember,
  removeMember,
  deleteProject,
};
