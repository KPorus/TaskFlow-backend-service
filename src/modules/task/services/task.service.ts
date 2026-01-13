import { HTTP_STATUS_CODES } from "@/utils/http-status-codes";
import { AppError } from "@/types/error.type";
import { Task } from "../models/task.model";
import { ITask } from "../types/task.types";
import { Types } from "mongoose";

const createTask = async (data: Partial<ITask>) => {
  const task = await Task.createTask(data);
  return {
    message: "Task created successfully",
    task,
  };
};

const getTaskList = async (teamId: Types.ObjectId | string) => {
  const tasks = await Task.findTaskList(teamId);
  if (!tasks) {
    throw new AppError(HTTP_STATUS_CODES.NOT_FOUND, "No tasks found for team");
  }
  return {
    message: "Task list fetched successfully",
    tasks,
  };
}

const assignTask = async (userId: Types.ObjectId | string) => {
  const tasks = await Task.assignTask(userId);
  if (!tasks) {
    throw new AppError(HTTP_STATUS_CODES.NOT_FOUND, "No tasks found for user");
  }
  return {
    message: "User tasks fetched successfully",
    tasks,
  };
};

const deleteTask = async (id: Types.ObjectId | string) => {
  const deleted_task = await Task.deleteTask(id);

  return {
    message: "Task Deleted Successfully",
    task: deleted_task,
  };
};

const updateTask = async (
  taskId: Types.ObjectId | string,
  updateData: Partial<ITask>,
) => {
  const updated_task = await Task.updateTask(taskId, updateData);

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
