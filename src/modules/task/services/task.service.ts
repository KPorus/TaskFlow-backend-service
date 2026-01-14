import { HTTP_STATUS_CODES } from "@/utils/http-status-codes";
import { User } from "@/modules/auth/models/auth.model";
import { AppError } from "@/types/error.type";
import { Task } from "../models/task.model";
import { ITask } from "../types/task.types";
import { Types } from "mongoose";
import { io } from "@/server";
const createTask = async (data: Partial<ITask>) => {
  let user;
  if (data!.assignee) {
    user = await User.findById({ _id: data.assignee });
    if (!user) {
      throw new AppError(HTTP_STATUS_CODES.NOT_FOUND, "No User found for task");
    }
  }

  const task = await Task.createTask(data);

  if (task.team) {
    io.to(String(task.team)).emit("taskCreated", task);
  }

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
};

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
  if (deleted_task?.team) {
    io.to(String(deleted_task.team)).emit("taskDelete", deleted_task);
  }
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
  if (updated_task?.team) {
    io.to(String(updated_task.team)).emit("taskUpdate", updated_task);
  }
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
