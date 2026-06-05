import { TCreateCommentInput } from "../validators/comment.validator";
import { AuthRequest } from "@/modules/auth/types/auth.types";
import { HTTP_STATUS_CODES } from "@/utils/http-status-codes";
import { commentService } from "../services/comment.service";
import { sendResponse } from "@/handlers/response.handler";
import { Response } from "express";

const create = async (req: AuthRequest, res: Response) => {
  const { taskId } = req.params as { taskId: string };
  const { text } = req.body as TCreateCommentInput;
  const result = await commentService.createComment(
    taskId,
    req.user!.id,
    text,
    req.user,
  );
  return sendResponse(
    res,
    result,
    HTTP_STATUS_CODES.CREATED,
    "Comment created successfully",
  );
};

const list = async (req: AuthRequest, res: Response) => {
  const { taskId } = req.params as { taskId: string };
  const result = await commentService.getByTask(taskId, req.user);
  sendResponse(
    res,
    result,
    HTTP_STATUS_CODES.OK,
    "Comments fetched successfully",
  );
};

const remove = async (req: AuthRequest, res: Response) => {
  const { commentId } = req.params as { commentId: string };
  const result = await commentService.deleteComment(commentId, req.user!);
  sendResponse(
    res,
    result,
    HTTP_STATUS_CODES.OK,
    "Comment deleted successfully",
  );
};

export const commentController = {
  create,
  list,
  remove,
};
