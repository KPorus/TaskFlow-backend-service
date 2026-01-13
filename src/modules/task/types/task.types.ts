import { TaskPriority, TaskStatus } from "../models/task.model";
import { Document, Types } from "mongoose";

export interface ITask {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: Types.ObjectId;
  creator: Types.ObjectId;
  team: Types.ObjectId;
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
  team: Types.ObjectId;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
