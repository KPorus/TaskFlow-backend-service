import { AuthRequest } from "@/modules/auth/types/auth.types";
import { HTTP_STATUS_CODES } from "@/utils/http-status-codes";
import { sendResponse } from "@/handlers/response.handler";
import { teamService } from "../services/team.service";
import { Request, Response } from "express";
import { Types } from "mongoose";

const createTeam = async (req: AuthRequest, res: Response) => {
  const { name } = req.body;
  console.log(req.user!.id);
  const result = await teamService.createTeam({
    name,
    owner: req.user!.id,
  });
  sendResponse(
    res,
    result,
    HTTP_STATUS_CODES.CREATED,
    "Team Created Successfully",
  );
};

const getUserTeams = async (req: AuthRequest, res: Response) => {
  // console.log(req.user);
  const result = await teamService.getUserTeams(req.user!.id);
  sendResponse(
    res,
    result,
    HTTP_STATUS_CODES.OK,
    "User Teams Fetched Successfully",
  );
};

const addMember = async (req: AuthRequest, res: Response) => {
  const { teamId } = req.params as { teamId: string };
  const { user } = req.body;
  const result = await teamService.addMember(new Types.ObjectId(teamId), {
    user,
  });
  sendResponse(
    res,
    result,
    HTTP_STATUS_CODES.OK,
    "Member Added to Team Successfully",
  );
};

const removeMember = async (req: AuthRequest, res: Response) => {
  const { teamId, memberId } = req.body;
  // console.log("remove api: ", teamId,memberId);
  const result = await teamService.removeMember(teamId, memberId);
  sendResponse(
    res,
    result,
    HTTP_STATUS_CODES.OK,
    "Member Removed from Team Successfully",
  );
};
const deleteTeam = async (req: Request, res: Response) => {
  const { id } = req.body;
  const result = await teamService.deleteTeam(id);
  sendResponse(
    res,
    result,
    HTTP_STATUS_CODES.CREATED,
    "Team Deleted Successfully",
  );
};

export const teamController = {
  createTeam,
  getUserTeams,
  addMember,
  removeMember,
  deleteTeam,
};
