import { notificationService } from "../services/notification.service";
import { AuthRequest } from "@/modules/auth/types/auth.types";
import { HTTP_STATUS_CODES } from "@/utils/http-status-codes";
import { sendResponse } from "@/handlers/response.handler";
import { Response } from "express";

const list = async (req: AuthRequest, res: Response) => {
  const result = await notificationService.getByUser(req.user!.id);
  sendResponse(
    res,
    result,
    HTTP_STATUS_CODES.OK,
    "Notifications fetched successfully",
  );
};

const markRead = async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await notificationService.markRead(id, req.user!.id);
  sendResponse(
    res,
    result,
    HTTP_STATUS_CODES.OK,
    "Notification updated successfully",
  );
};

export const notificationController = {
  list,
  markRead,
};
