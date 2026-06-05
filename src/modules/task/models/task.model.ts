import { TaskDocument, TaskListQuery } from "../types/task.types";
import { Project } from "@/modules/project/models/project.model";
import { Model, model, Schema, Types } from "mongoose";

export interface TaskModelType extends Model<TaskDocument> {
  findTaskList(
    projectId: Types.ObjectId | string,
    query?: Omit<TaskListQuery, "projectId">,
  ): Promise<{ tasks: TaskDocument[]; total: number }>;
  assignTask(
    userId: Types.ObjectId | string,
    taskId: Types.ObjectId | string,
  ): Promise<TaskDocument | null>;
  createTask(data: Partial<TaskDocument>): Promise<TaskDocument>;
  deleteTask(
    id: Types.ObjectId | string,
    projectId: Types.ObjectId | string,
  ): Promise<TaskDocument | null>;
  updateTask(
    taskId: Types.ObjectId | string,
    updateData: Partial<TaskDocument>,
  ): Promise<TaskDocument | null>;
  findByTitleInProject(
    projectId: Types.ObjectId | string,
    title: string,
    excludeTaskId?: Types.ObjectId | string,
  ): Promise<TaskDocument | null>;
  clearAssigneeForMemberInProject(
    projectId: Types.ObjectId | string,
    memberId: Types.ObjectId | string,
  ): Promise<{ modifiedCount?: number }>;
}

export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
}

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

const TaskSchema = new Schema<TaskDocument, TaskModelType>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.TODO,
    },
    priority: {
      type: String,
      enum: Object.values(TaskPriority),
      default: TaskPriority.MEDIUM,
    },
    assignee: {
      type: Types.ObjectId,
      ref: "User",
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    dueDate: {
      type: Date,
    },
  },
  { timestamps: true },
);

TaskSchema.index({ project: 1, title: 1 });

TaskSchema.statics.findByTitleInProject = async function (
  projectId: Types.ObjectId | string,
  title: string,
  excludeTaskId?: Types.ObjectId | string,
) {
  const filter: Record<string, unknown> = {
    project: projectId,
    title: { $regex: new RegExp(`^${title.trim()}$`, "i") },
  };
  if (excludeTaskId) {
    filter._id = { $ne: excludeTaskId };
  }
  return await this.findOne(filter);
};

TaskSchema.statics.findTaskList = async function (
  projectId: Types.ObjectId | string,
  query: Omit<TaskListQuery, "projectId"> = {},
) {
  const {
    search,
    status,
    priority,
    assignee,
    deadlineStatus,
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 20,
  } = query;

  const filter: Record<string, unknown> = { project: projectId };

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }
  if (status?.length) filter.status = { $in: status };
  if (priority?.length) filter.priority = { $in: priority };
  if (assignee) filter.assignee = assignee;

  const now = new Date();
  if (deadlineStatus === "OVERDUE") {
    filter.dueDate = { $lt: now };
    filter.status = { $ne: TaskStatus.DONE };
  } else if (deadlineStatus === "UPCOMING") {
    filter.dueDate = { $gte: now };
  }

  const sort: Record<string, 1 | -1> = {};
  const order = sortOrder === "asc" ? 1 : -1;
  if (sortBy === "priority") {
    const tasks = await this.find(filter).populate("assignee", "name email");
    const sorted = tasks.sort(
      (a, b) =>
        (PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority]) *
        (sortOrder === "asc" ? -1 : 1),
    );
    const total = sorted.length;
    const start = (page - 1) * limit;
    return { tasks: sorted.slice(start, start + limit), total };
  }
  sort[sortBy] = order;

  const total = await this.countDocuments(filter);
  const tasks = await this.find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("assignee", "name email");

  return { tasks, total };
};

TaskSchema.statics.assignTask = async function (
  userId: Types.ObjectId | string,
  taskId: Types.ObjectId | string,
) {
  const projectCheck = await Project.findMemberProjects(userId);
  if (!projectCheck || projectCheck.length === 0) {
    return null;
  }
  return await this.findByIdAndUpdate(
    taskId,
    { assignee: userId },
    { new: true },
  );
};

TaskSchema.statics.createTask = async function (data: Partial<TaskDocument>) {
  return await this.create(data);
};

TaskSchema.statics.deleteTask = async function (
  id: Types.ObjectId | string,
  projectId: Types.ObjectId | string,
) {
  const task = await this.findById(id);
  if (task?.project.equals(projectId)) return await this.deleteOne({ _id: id });
  return null;
};

TaskSchema.statics.updateTask = async function (
  taskId: Types.ObjectId | string,
  updateData: Partial<TaskDocument>,
) {
  return await this.findByIdAndUpdate(taskId, updateData, { new: true });
};

TaskSchema.statics.clearAssigneeForMemberInProject = async function (
  projectId: Types.ObjectId | string,
  memberId: Types.ObjectId | string,
) {
  return await this.updateMany(
    { project: projectId, assignee: memberId },
    { $unset: { assignee: 1 } },
  );
};

export const Task = model<TaskDocument, TaskModelType>("Task", TaskSchema);
