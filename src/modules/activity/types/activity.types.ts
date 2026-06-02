export enum ActivityType {
  PROJECT_CREATED = "PROJECT_CREATED",
  PROJECT_UPDATED = "PROJECT_UPDATED",
  TASK_CREATED = "TASK_CREATED",
  TASK_ASSIGNED = "TASK_ASSIGNED",
  TASK_COMPLETED = "TASK_COMPLETED",
  MEMBER_ADDED = "MEMBER_ADDED",
  COMMENT_ADDED = "COMMENT_ADDED",
}

export interface ActivityPayload {
  type: ActivityType;
  message: string;
  actor: import("mongoose").Types.ObjectId | string;
  project?: import("mongoose").Types.ObjectId | string;
  task?: import("mongoose").Types.ObjectId | string;
}
