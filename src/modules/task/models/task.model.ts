import { Model, model, Schema, Types } from "mongoose";
import { TaskDocument } from "../types/task.types";

export interface TaskModelType extends Model<TaskDocument> {
  findTaskList(teamId: Types.ObjectId | string): Promise<TaskDocument[]>;
  assignTask(userId: Types.ObjectId | string): Promise<TaskDocument[]>;
  createTask(data: Partial<TaskDocument>): Promise<TaskDocument>;
  deleteTask(id: Types.ObjectId | string): Promise<TaskDocument | null>;
  updateTask(
    taskId: Types.ObjectId | string,
    updateData: Partial<TaskDocument>,
  ): Promise<TaskDocument | null>;
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
    team: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    dueDate: {
      type: Date,
    },
  },
  { timestamps: true },
);

// Wrap logic with error handling using mongooseError
TaskSchema.statics.findTaskList = async function (
  teamId: Types.ObjectId | string,
) {
  return await this.find({ team: teamId });
};

TaskSchema.statics.assignTask = async function (
  userId: Types.ObjectId | string,
) {
  return await this.find({ assignee: userId });
};

TaskSchema.statics.createTask = async function (data: Partial<TaskDocument>) {
  return await this.create(data);
};

TaskSchema.statics.removeMember = async function (
  teamId: Types.ObjectId | string,
  memberId: Types.ObjectId | string,
) {
  return await this.findByIdAndUpdate(
    teamId,
    { $pull: { members: { user: memberId } } },
    { new: true },
  );
};

TaskSchema.statics.deleteTask = async function (id: Types.ObjectId | string) {
  return await this.findByIdAndDelete(id);
};

TaskSchema.statics.updateTask = async function (
  taskId: Types.ObjectId | string,
  updateData: Partial<TaskDocument>,
) {
  return await this.findByIdAndUpdate(taskId, updateData, { new: true });
};
export const Task = model<TaskDocument, TaskModelType>("Task", TaskSchema);
