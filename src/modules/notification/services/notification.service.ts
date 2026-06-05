import { Notification } from "../models/notification.model";
import { Types } from "mongoose";
import { io } from "@/server";

const notify = async (
  userId: string,
  payload: { type: string; message: string; link?: string },
) => {
  const notification = await Notification.createNotification({
    user: new Types.ObjectId(userId),
    type: payload.type,
    message: payload.message,
    link: payload.link,
    read: false,
  });

  io.to(`user:${userId}`).emit("notification", notification);
  return notification;
};

const getByUser = async (userId: Types.ObjectId | string) => {
  const notifications = await Notification.getByUser(userId);
  return {
    message: "Notifications fetched",
    notifications,
  };
};

const markRead = async (
  id: Types.ObjectId | string,
  userId: Types.ObjectId | string,
) => {
  const notification = await Notification.markRead(id, userId);
  return {
    message: "Notification marked as read",
    notification,
  };
};

export const notificationService = {
  notify,
  getByUser,
  markRead,
};
