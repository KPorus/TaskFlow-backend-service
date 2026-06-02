import { ActivityPayload } from "@/modules/activity/types/activity.types";
import { Activity } from "@/modules/activity/models/activity.model";
import { Types } from "mongoose";

export async function logActivity(payload: ActivityPayload) {
  return Activity.createActivity({
    type: payload.type,
    message: payload.message,
    actor:
      typeof payload.actor === "string"
        ? new Types.ObjectId(payload.actor)
        : payload.actor,
    project: payload.project
      ? typeof payload.project === "string"
        ? new Types.ObjectId(payload.project)
        : payload.project
      : undefined,
    task: payload.task
      ? typeof payload.task === "string"
        ? new Types.ObjectId(payload.task)
        : payload.task
      : undefined,
  });
}
