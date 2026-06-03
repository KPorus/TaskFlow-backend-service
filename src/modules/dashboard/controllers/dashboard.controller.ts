import { dashboardService } from "../services/dashboard.service";
import { AuthRequest } from "@/modules/auth/types/auth.types";
import { HTTP_STATUS_CODES } from "@/utils/http-status-codes";
import { sendResponse } from "@/handlers/response.handler";
import { Response } from "express";

const getStats = async (req: AuthRequest, res: Response) => {
  const stats = await dashboardService.getStats(req.user!);
  sendResponse(res, { stats }, HTTP_STATUS_CODES.OK, "Stats fetched");
};

const getProjectSummaries = async (req: AuthRequest, res: Response) => {
  const summaries = await dashboardService.getProjectSummaries(req.user!);
  sendResponse(res, { summaries }, HTTP_STATUS_CODES.OK, "Summaries fetched");
};

const getWorkload = async (req: AuthRequest, res: Response) => {
  const workload = await dashboardService.getWorkload(req.user!);
  sendResponse(res, { workload }, HTTP_STATUS_CODES.OK, "Workload fetched");
};

const getUpcomingDeadlines = async (req: AuthRequest, res: Response) => {
  const days = Number(req.query.days) || 7;
  const tasks = await dashboardService.getUpcomingDeadlines(req.user!, days);
  sendResponse(res, { tasks }, HTTP_STATUS_CODES.OK, "Deadlines fetched");
};

const getHighPriority = async (req: AuthRequest, res: Response) => {
  const tasks = await dashboardService.getHighPriority(req.user!);
  sendResponse(res, { tasks }, HTTP_STATUS_CODES.OK, "High priority fetched");
};

const getCharts = async (req: AuthRequest, res: Response) => {
  const charts = await dashboardService.getCharts(req.user!);
  sendResponse(res, { charts }, HTTP_STATUS_CODES.OK, "Charts fetched");
};

export const dashboardController = {
  getStats,
  getProjectSummaries,
  getWorkload,
  getUpcomingDeadlines,
  getHighPriority,
  getCharts,
};
