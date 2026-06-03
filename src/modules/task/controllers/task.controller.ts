import {
  TCreateTaskInput,
  TTaskInput,
  TTaskListInput,
} from "../validators/task.validator";
import { AuthRequest } from "@/modules/auth/types/auth.types";
import { HTTP_STATUS_CODES } from "@/utils/http-status-codes";
import { sendResponse } from "@/handlers/response.handler";
import { taskService } from "../services/task.service";
import { Response } from "express";
import { Types } from "mongoose";

const createTask = async (req: AuthRequest, res: Response) => {
  const { title, description, dueDate, priority, assignee, status } =
    req.body as TCreateTaskInput;
  const projectId = req.params.projectId as string;
  const result = await taskService.createTask(
    {
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority,
      status,
      assignee:
        typeof assignee === "string" ? new Types.ObjectId(assignee) : assignee,
      creator: new Types.ObjectId(String(req.user!.id)),
      project: new Types.ObjectId(projectId),
    },
    req.user,
  );
  sendResponse(
    res,
    result,
    HTTP_STATUS_CODES.CREATED,
    "Task Created Successfully",
  );
};

const getTaskList = async (req: AuthRequest, res: Response) => {
  const body = req.body as TTaskListInput;
  const result = await taskService.getTaskList(body, req.user);
  sendResponse(
    res,
    result,
    HTTP_STATUS_CODES.OK,
    "Task List Fetched Successfully",
  );
};

const assignTask = async (req: AuthRequest, res: Response) => {
  const { id, taskId, projectId } = req.body;
  const result = await taskService.assignTask(id, taskId, projectId, req.user);
  sendResponse(res, result, HTTP_STATUS_CODES.OK, "Task Assigned Successfully");
};

const deleteTask = async (req: AuthRequest, res: Response) => {
  const { id, projectId } = req.body;
  const result = await taskService.deleteTask(id, projectId, req.user!);
  sendResponse(res, result, HTTP_STATUS_CODES.OK, "Task Deleted Successfully");
};

const updateTask = async (req: AuthRequest, res: Response) => {
  const { taskId } = req.params as { taskId: string };
  const body = req.body as TTaskInput;
  const updateData: Record<string, unknown> = { ...body };
  if (body.dueDate) updateData.dueDate = new Date(body.dueDate);
  if (body.assignee) updateData.assignee = new Types.ObjectId(body.assignee);

  const result = await taskService.updateTask(taskId, updateData, req.user!);
  sendResponse(res, result, HTTP_STATUS_CODES.OK, "Task Updated Successfully");
};

export const taskController = {
  createTask,
  getTaskList,
  assignTask,
  deleteTask,
  updateTask,
};
