import { dashboardController } from "../controllers/dashboard.controller";
import { asyncHandler } from "@/handlers/async.handler";
import express from "express";

const router = express.Router();

router.get("/stats", asyncHandler(dashboardController.getStats));
router.get(
  "/project-summaries",
  asyncHandler(dashboardController.getProjectSummaries),
);
router.get("/workload", asyncHandler(dashboardController.getWorkload));
router.get(
  "/upcoming-deadlines",
  asyncHandler(dashboardController.getUpcomingDeadlines),
);
router.get("/high-priority", asyncHandler(dashboardController.getHighPriority));
router.get("/charts", asyncHandler(dashboardController.getCharts));

export const dashboardRouter = router;
