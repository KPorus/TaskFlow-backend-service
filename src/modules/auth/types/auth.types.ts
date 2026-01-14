import { Document, Types } from "mongoose";
import { Request } from "express";

export interface AuthUser {
  id: Types.ObjectId;
  email: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface AuthType extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}
