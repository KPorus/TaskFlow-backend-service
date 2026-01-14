import { AuthRequest } from "@/modules/auth/types/auth.types";
import { HTTP_STATUS_CODES } from "@/utils/http-status-codes";
import { sendResponse } from "@/handlers/response.handler";
import { TTaskInput } from "../validators/task.validator";
import { taskService } from "../services/task.service";
import { Request, Response } from "express";
import { Types } from "mongoose";

const createTask = async (req: AuthRequest, res: Response) => {
  const { title, description, dueDate, priority, assignee } =
    req.body as TTaskInput;
  const team = req.params.teamId as string;
  // console.log(req.body);
  const result = await taskService.createTask({
    title,
    description,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    priority,
    assignee:
      typeof assignee === "string" ? new Types.ObjectId(assignee) : assignee,
    creator: req.user!.id,
    team: typeof team === "string" ? new Types.ObjectId(team) : team,
  });
  sendResponse(
    res,
    result,
    HTTP_STATUS_CODES.CREATED,
    "Task Created Successfully",
  );
};

const getTaskList = async (req: Request, res: Response) => {
  const { teamId } = req.body;
  const result = await taskService.getTaskList(teamId);
  sendResponse(
    res,
    result,
    HTTP_STATUS_CODES.OK,
    "Task List Fetched Successfully",
  );
};
const assignTask = async (req: AuthRequest, res: Response) => {
  const { id } = req.body;
  const result = await taskService.assignTask(id);
  sendResponse(
    res,
    result,
    HTTP_STATUS_CODES.OK,
    "User Tasks Fetched Successfully",
  );
};

const deleteTask = async (req: Request, res: Response) => {
  const { id } = req.body;
  const result = await taskService.deleteTask(id);
  sendResponse(res, result, HTTP_STATUS_CODES.OK, "Task Deleted Successfully");
};

const updateTask = async (req: Request, res: Response) => {
  const { taskId, updateData } = req.body;
  const result = await taskService.updateTask(taskId, updateData);
  sendResponse(res, result, HTTP_STATUS_CODES.OK, "Task Updated Successfully");
};

export const taskController = {
  createTask,
  getTaskList,
  assignTask,
  deleteTask,
  updateTask,
};
