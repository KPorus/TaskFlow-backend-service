import { Document, Types } from "mongoose";
import { Request } from "express";

export enum UserRole {
  ADMIN = "ADMIN",
  PROJECT_MANAGER = "PROJECT_MANAGER",
  TEAM_MEMBER = "TEAM_MEMBER",
}

export interface AuthUser {
  id: Types.ObjectId;
  email: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface AuthType extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
