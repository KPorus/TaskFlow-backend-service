import { ProjectDocument, ProjectStatus } from "../types/project.types";
import { Task } from "@/modules/task/models/task.model";
import { Model, model, Schema, Types } from "mongoose";

export interface ProjectModelType extends Model<ProjectDocument> {
  findByProjectId(Id: Types.ObjectId | string): Promise<ProjectDocument | null>;
  findMemberProjects(
    userId: Types.ObjectId | string,
  ): Promise<ProjectDocument[]>;
  findVisibleProjects(
    userId: Types.ObjectId | string,
  ): Promise<ProjectDocument[]>;
  findAllProjects(): Promise<ProjectDocument[]>;
  findOwnerProjects(
    ownerId: Types.ObjectId | string,
  ): Promise<ProjectDocument[]>;
  createProject(data: Partial<ProjectDocument>): Promise<ProjectDocument>;
  updateProject(
    projectId: Types.ObjectId | string,
    data: Partial<ProjectDocument>,
  ): Promise<ProjectDocument | null>;
  removeMember(
    projectId: Types.ObjectId | string,
    memberId: Types.ObjectId | string,
  ): Promise<ProjectDocument | null>;
  deleteProject(
    id: Types.ObjectId | string,
  ): Promise<{ deletedCount?: number }>;
  addMember(
    projectId: Types.ObjectId | string,
    member: { user: Types.ObjectId | string },
  ): Promise<ProjectDocument | null>;
}

const ProjectSchema = new Schema<ProjectDocument, ProjectModelType>(
  {
    name: { type: String, required: true },
    description: { type: String },
    deadline: { type: Date },
    status: {
      type: String,
      enum: Object.values(ProjectStatus),
      default: ProjectStatus.ACTIVE,
    },
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

ProjectSchema.statics.findByProjectId = async function (
  Id: Types.ObjectId | string,
) {
  return await this.findOne({ _id: Id });
};

ProjectSchema.statics.findMemberProjects = async function (
  userId: Types.ObjectId | string,
) {
  return await this.find({ "members.user": userId }).populate(
    "members.user",
    "name email role",
  );
};

ProjectSchema.statics.findVisibleProjects = async function (
  userId: Types.ObjectId | string,
) {
  return await this.find({
    $or: [{ owner: userId }, { "members.user": userId }],
  }).populate("members.user", "name email role");
};

ProjectSchema.statics.findAllProjects = async function () {
  return await this.find().populate("members.user", "name email role");
};

ProjectSchema.statics.findOwnerProjects = async function (
  ownerId: Types.ObjectId | string,
) {
  return await this.find({ owner: ownerId }).populate(
    "members.user",
    "name email role",
  );
};

ProjectSchema.statics.createProject = async function (
  data: Partial<ProjectDocument>,
) {
  const owner = data.owner;
  return this.create({
    name: data.name,
    description: data.description,
    deadline: data.deadline,
    status: data.status ?? ProjectStatus.ACTIVE,
    owner,
    members: owner ? [{ user: owner }] : [],
  });
};

ProjectSchema.statics.updateProject = async function (
  projectId: Types.ObjectId | string,
  data: Partial<ProjectDocument>,
) {
  return await this.findByIdAndUpdate(projectId, data, { new: true });
};

ProjectSchema.statics.addMember = async function (
  projectId: Types.ObjectId | string,
  member: { user: Types.ObjectId | string },
) {
  await this.findByIdAndUpdate(
    projectId,
    { $push: { members: member } },
    { new: true },
  );
  return await this.findById(projectId).populate(
    "members.user",
    "name email role",
  );
};

ProjectSchema.statics.removeMember = async function (
  projectId: Types.ObjectId | string,
  memberId: Types.ObjectId | string,
) {
  await this.findByIdAndUpdate(
    projectId,
    { $pull: { members: { user: memberId } } },
    { new: true },
  );
  return await this.findById(projectId).populate(
    "members.user",
    "name email role",
  );
};

ProjectSchema.statics.deleteProject = async function (
  id: Types.ObjectId | string,
) {
  const project = await this.findById({ _id: id });
  await Task.deleteMany({ project: id });
  if (project) return await this.deleteOne({ _id: id });
  return { deletedCount: 0 };
};

export const Project = model<ProjectDocument, ProjectModelType>(
  "Project",
  ProjectSchema,
);
