import { Document, Types } from "mongoose";

export enum ProjectStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  ON_HOLD = "ON_HOLD",
}

export interface ProjectMember {
  user: Types.ObjectId;
}

export interface Project {
  name: string;
  description?: string;
  deadline?: Date;
  status: ProjectStatus;
  owner: Types.ObjectId;
  members: ProjectMember[];
}

export interface ProjectDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  deadline?: Date;
  status: ProjectStatus;
  owner: Types.ObjectId;
  members: ProjectMember[];
  createdAt: Date;
  updatedAt: Date;
}
