import { Activity } from "../models/activity.model";

const getRecent = async (limit = 10) => {
  const activities = await Activity.getRecent(limit);
  return {
    message: "Recent activities fetched",
    activities,
  };
};

export const activityService = {
  getRecent,
};
