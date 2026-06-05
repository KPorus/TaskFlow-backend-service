import { Model, Schema, Types, model } from "mongoose";

export interface NotificationDocument {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  type: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationModelType extends Model<NotificationDocument> {
  createNotification(
    data: Partial<NotificationDocument>,
  ): Promise<NotificationDocument>;
  getByUser(userId: Types.ObjectId | string): Promise<NotificationDocument[]>;
  markRead(
    id: Types.ObjectId | string,
    userId: Types.ObjectId | string,
  ): Promise<NotificationDocument | null>;
}

const NotificationSchema = new Schema<
  NotificationDocument,
  NotificationModelType
>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

NotificationSchema.statics.createNotification = async function (
  data: Partial<NotificationDocument>,
) {
  return await this.create(data);
};

NotificationSchema.statics.getByUser = async function (
  userId: Types.ObjectId | string,
) {
  return await this.find({ user: userId }).sort({ createdAt: -1 }).limit(50);
};

NotificationSchema.statics.markRead = async function (
  id: Types.ObjectId | string,
  userId: Types.ObjectId | string,
) {
  return await this.findOneAndUpdate(
    { _id: id, user: userId },
    { read: true },
    { new: true },
  );
};

export const Notification = model<NotificationDocument, NotificationModelType>(
  "Notification",
  NotificationSchema,
);
