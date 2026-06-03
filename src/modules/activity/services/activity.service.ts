import { getVisibleProjectIds } from "@/helpers/project-access.helper";
import { AuthUser } from "@/modules/auth/types/auth.types";
import { isAdmin } from "@/helpers/permission.helper";
import { Activity } from "../models/activity.model";

const getRecent = async (user: AuthUser, limit = 10) => {
  const projectIds = await getVisibleProjectIds(user);
  const activities = await Activity.getRecent(
    limit,
    isAdmin(user) ? undefined : projectIds,
  );
  return {
    message: "Recent activities fetched",
    activities,
  };
};

export const activityService = {
  getRecent,
};
