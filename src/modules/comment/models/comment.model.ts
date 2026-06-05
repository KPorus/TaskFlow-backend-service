import {
  ClientSession,
  DeleteResult,
  Model,
  Schema,
  Types,
  model,
} from "mongoose";

export interface CommentDocument {
  _id: Types.ObjectId;
  task: Types.ObjectId;
  author: Types.ObjectId;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentModelType extends Model<CommentDocument> {
  createComment(data: Partial<CommentDocument>): Promise<CommentDocument>;
  findByTask(taskId: Types.ObjectId | string): Promise<CommentDocument[]>;
  deleteComment(id: Types.ObjectId | string): Promise<CommentDocument | null>;
  deleteManyById(
    taskId: Types.ObjectId | string,
    options?: { session?: ClientSession },
  ): Promise<DeleteResult>;
}

const CommentSchema = new Schema<CommentDocument, CommentModelType>(
  {
    task: { type: Schema.Types.ObjectId, ref: "Task", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

CommentSchema.statics.createComment = async function (
  data: Partial<CommentDocument>,
) {
  return await this.create(data);
};

CommentSchema.statics.findByTask = async function (
  taskId: Types.ObjectId | string,
) {
  return await this.find({ task: taskId })
    .sort({ createdAt: -1 })
    .populate("author", "name email");
};

CommentSchema.statics.deleteComment = async function (
  id: Types.ObjectId | string,
) {
  return await this.findByIdAndDelete(id);
};

CommentSchema.statics.deleteManyById = async function (
  taskId: Types.ObjectId | string,
  options?: { session?: ClientSession },
) {
  return this.deleteMany({ task: taskId }, { session: options?.session });
};

export const Comment = model<CommentDocument, CommentModelType>(
  "Comment",
  CommentSchema,
);
