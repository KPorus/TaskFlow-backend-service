import { Types } from "mongoose";
import { io } from "@/server";

export type MembershipAction = "ADDED" | "REMOVED";

export const emitMembershipChanged = (
  memberUserId: Types.ObjectId | string,
  payload: {
    action: MembershipAction;
    projectId: string;
    project?: unknown;
  },
) => {
  io.to(`user:${String(memberUserId)}`).emit("membershipChanged", payload);
};

export const emitProjectRoomMembership = (
  projectId: Types.ObjectId | string,
  event: "projectMemberAdd" | "projectMemberRemove",
  project: unknown,
) => {
  io.to(String(projectId)).emit(event, project);
};
