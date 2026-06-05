import { TaskPriority, TaskStatus } from "../models/task.model";
import { Document, Types } from "mongoose";

export interface ITask {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: Types.ObjectId;
  creator: Types.ObjectId;
  project: Types.ObjectId;
  dueDate?: Date;
}

export interface TaskDocument extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: Types.ObjectId;
  creator: Types.ObjectId;
  project: Types.ObjectId;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskListQuery {
  projectId: string;
  search?: string;
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assignee?: string;
  deadlineStatus?: "UPCOMING" | "OVERDUE";
  sortBy?: "createdAt" | "dueDate" | "priority" | "updatedAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}
