import { activityController } from "../controllers/activity.controller";
import { asyncHandler } from "@/handlers/async.handler";
import express from "express";

const router = express.Router();

router.get("/recent", asyncHandler(activityController.getRecent));

export const activityRouter = router;
