import { activityService } from "../services/activity.service";
import { AuthRequest } from "@/modules/auth/types/auth.types";
import { HTTP_STATUS_CODES } from "@/utils/http-status-codes";
import { sendResponse } from "@/handlers/response.handler";
import { Response } from "express";

const getRecent = async (req: AuthRequest, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const result = await activityService.getRecent(req.user!, limit);
  sendResponse(
    res,
    result,
    HTTP_STATUS_CODES.OK,
    "Activities fetched successfully",
  );
};

export const activityController = {
  getRecent,
};
