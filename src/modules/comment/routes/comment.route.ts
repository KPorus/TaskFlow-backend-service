import { commentController } from "../controllers/comment.controller";
import { commentValidator } from "../validators/comment.validator";
import { validate } from "@/middlewares/validate.middleware";
import { asyncHandler } from "@/handlers/async.handler";
import express from "express";

const router = express.Router();

router.post(
  "/:taskId",
  validate(commentValidator.createCommentSchema),
  asyncHandler(commentController.create),
);

router.get("/:taskId", asyncHandler(commentController.list));

router.delete("/:commentId", asyncHandler(commentController.remove));

export const commentRouter = router;
