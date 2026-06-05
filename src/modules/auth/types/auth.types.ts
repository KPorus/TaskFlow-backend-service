import { Document, Types } from "mongoose";
import { Request } from "express";

export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

/** Legacy JWT/DB values map to USER */
export const normalizeUserRole = (role?: string): UserRole => {
  if (role === UserRole.ADMIN) return UserRole.ADMIN;
  return UserRole.USER;
};

export interface AuthUser {
  id: Types.ObjectId | string;
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
