import { HTTP_STATUS_CODES } from "@/utils/http-status-codes";
import { AppError } from "@/types/error.type";
import { Team } from "../models/team.model";
import { Types } from "mongoose";

const createTeam = async (data: {
  name: string;
  owner: Types.ObjectId | string;
}) => {
  console.log(data.owner);
  const team = await Team.createTeam({
    name: data.name,
    owner:
      typeof data.owner === "string"
        ? new Types.ObjectId(data.owner)
        : data.owner,
  });
  return {
    message: "Team created successfully",
    team,
  };
};

const getUserTeams = async (userId: Types.ObjectId | string) => {
  const teams = await Team.findMemberTeams(userId);
  if (!teams) {
    throw new AppError(HTTP_STATUS_CODES.NOT_FOUND, "No teams found for user");
  }
  return {
    message: "User teams fetched successfully",
    teams,
  };
};

const addMember = async (
  teamId: Types.ObjectId | string,
  member: { user: Types.ObjectId | string },
) => {
  const team = await Team.addmember(teamId, member);
  return {
    message: "Member added successfully",
    team,
  };
};

const removeMember = async (
  teamId: Types.ObjectId | string,
  memberId: Types.ObjectId | string,
) => {
  const team = await Team.removeMember(teamId, memberId);
  return {
    message: "Member removed successfully",
    team,
  };
};

const deleteTeam = async (id: string) => {
  const deleted_user = await Team.deleteTeam(id);

  return {
    message: "Account Deleted Successfully",
    user: deleted_user,
  };
};
export const teamService = {
  createTeam,
  getUserTeams,
  addMember,
  removeMember,
  deleteTeam,
};
