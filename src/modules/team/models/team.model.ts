import { Task } from "@/modules/task/models/task.model";
import { Model, model, Schema, Types } from "mongoose";
import { TeamDocument } from "../types/team.types";

export interface TeamModelType extends Model<TeamDocument> {
  findByTeamId(Id: Types.ObjectId | string): Promise<TeamDocument | null>;
  findMemberTeams(userId: Types.ObjectId | string): Promise<TeamDocument[]>;
  findOwnerTeams(
    ownerId: Types.ObjectId | string,
  ): Promise<TeamDocument | null>;
  createTeam(data: Partial<TeamDocument>): Promise<TeamDocument>;
  removeMember(
    teamId: Types.ObjectId | string,
    memberId: Types.ObjectId | string,
  ): Promise<TeamDocument | null>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deleteTeam(id: Types.ObjectId | string): any;
  addmember(
    teamId: Types.ObjectId | string,
    member: { user: Types.ObjectId | string },
  ): Promise<TeamDocument | null>;
}

const TeamSchema = new Schema<TeamDocument, TeamModelType>(
  {
    name: String,
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        _id: false,
      },
    ],
  },
  { timestamps: true },
);

// Wrap logic with error handling using mongooseError
TeamSchema.statics.findByTeamId = async function (Id: Types.ObjectId | string) {
  return await this.findOne({ _id: Id });
};

TeamSchema.statics.findMemberTeams = async function (
  userId: Types.ObjectId | string,
) {
  // console.log("get user team:", userId);
  // const data = await this.find({ "members.user": userId }).populate(
  //   "members.user",
  //   "name email",
  // );
  // console.log(data);
  return await this.find({ "members.user": userId }).populate(
    "members.user",
    "name email",
  );
};

TeamSchema.statics.findOwnerTeams = async function (
  ownerId: Types.ObjectId | string,
) {
  return await this.find({ owner: ownerId });
};

TeamSchema.statics.createTeam = async function (data: Partial<TeamDocument>) {
  const owner = data.owner;

  return this.create({
    name: data.name,
    owner,
    members: owner ? [{ user: owner }] : [],
  });
};

TeamSchema.statics.addmember = async function (
  teamId: Types.ObjectId | string,
  member: { user: Types.ObjectId | string },
) {
  return await this.findByIdAndUpdate(
    teamId,
    { $push: { members: member } },
    { new: true },
  );
};

TeamSchema.statics.removeMember = async function (
  teamId: Types.ObjectId | string,
  memberId: Types.ObjectId | string,
) {
  return await this.findByIdAndUpdate(
    teamId,
    { $pull: { members: { user: memberId } } },
    { new: true },
  );
};

TeamSchema.statics.deleteTeam = async function (id: Types.ObjectId | string) {
  const team = await this.findById({ _id: id });
  await Task.deleteMany({ team: id });
  if (team) return await this.deleteOne({ _id: id });
};
export const Team = model<TeamDocument, TeamModelType>("Team", TeamSchema);
