import { notificationController } from "../controllers/notification.controller";
import { asyncHandler } from "@/handlers/async.handler";
import express from "express";

const router = express.Router();

router.get("/", asyncHandler(notificationController.list));
router.put("/:id/read", asyncHandler(notificationController.markRead));

export const notificationRouter = router;
