import { ActivityType } from "../types/activity.types";
import { Model, Schema, Types, model } from "mongoose";

export interface ActivityDocument {
  _id: Types.ObjectId;
  type: ActivityType;
  message: string;
  actor: Types.ObjectId;
  project?: Types.ObjectId;
  task?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityModelType extends Model<ActivityDocument> {
  createActivity(data: Partial<ActivityDocument>): Promise<ActivityDocument>;
  getRecent(limit: number): Promise<ActivityDocument[]>;
}

const ActivitySchema = new Schema<ActivityDocument, ActivityModelType>(
  {
    type: { type: String, enum: Object.values(ActivityType), required: true },
    message: { type: String, required: true },
    actor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    project: { type: Schema.Types.ObjectId, ref: "Project" },
    task: { type: Schema.Types.ObjectId, ref: "Task" },
  },
  { timestamps: true },
);

ActivitySchema.statics.createActivity = async function (
  data: Partial<ActivityDocument>,
) {
  return await this.create(data);
};

ActivitySchema.statics.getRecent = async function (limit: number) {
  return await this.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("actor", "name email");
};

export const Activity = model<ActivityDocument, ActivityModelType>(
  "Activity",
  ActivitySchema,
);
