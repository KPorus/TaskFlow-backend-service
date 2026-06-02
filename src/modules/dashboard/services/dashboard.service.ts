import {
  Task,
  TaskPriority,
  TaskStatus,
} from "@/modules/task/models/task.model";
import { Project } from "@/modules/project/models/project.model";
import { Types } from "mongoose";

const getUserProjectIds = async (userId: Types.ObjectId | string) => {
  const projects = await Project.findMemberProjects(userId);
  return projects.map((p) => p._id);
};

const getStats = async (userId: Types.ObjectId | string) => {
  const projectIds = await getUserProjectIds(userId);
  const now = new Date();

  const [
    totalProjects,
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
  ] = await Promise.all([
    Project.countDocuments({ _id: { $in: projectIds } }),
    Task.countDocuments({ project: { $in: projectIds } }),
    Task.countDocuments({
      project: { $in: projectIds },
      status: TaskStatus.DONE,
    }),
    Task.countDocuments({
      project: { $in: projectIds },
      status: { $ne: TaskStatus.DONE },
    }),
    Task.countDocuments({
      project: { $in: projectIds },
      status: { $ne: TaskStatus.DONE },
      dueDate: { $lt: now },
    }),
  ]);

  return {
    totalProjects,
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
  };
};

const getProjectSummaries = async (userId: Types.ObjectId | string) => {
  const projects = await Project.findMemberProjects(userId);

  const summaries = await Promise.all(
    projects.map(async (project) => {
      const tasks = await Task.find({ project: project._id });
      const total = tasks.length;
      const completed = tasks.filter(
        (t) => t.status === TaskStatus.DONE,
      ).length;
      const pending = total - completed;
      const completionPercent =
        total > 0 ? Math.round((completed / total) * 100) : 0;

      let deadlineLabel = "";
      if (project.deadline) {
        const days = Math.ceil(
          (project.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        );
        if (days < 0) deadlineLabel = "Overdue";
        else if (days === 0) deadlineLabel = "Deadline today";
        else deadlineLabel = `Deadline in ${days} days`;
      }

      return {
        id: project._id,
        name: project.name,
        status: project.status,
        pendingTasks: pending,
        completionPercent,
        deadlineLabel,
      };
    }),
  );

  return summaries;
};

const getWorkload = async (userId: Types.ObjectId | string) => {
  const projectIds = await getUserProjectIds(userId);

  const workload = await Task.aggregate([
    { $match: { project: { $in: projectIds }, assignee: { $exists: true } } },
    {
      $group: {
        _id: "$assignee",
        total: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ["$status", TaskStatus.DONE] }, 1, 0] },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        userId: "$_id",
        name: "$user.name",
        email: "$user.email",
        total: 1,
        completed: 1,
        pending: { $subtract: ["$total", "$completed"] },
      },
    },
  ]);

  return workload;
};

const getUpcomingDeadlines = async (
  userId: Types.ObjectId | string,
  days = 7,
) => {
  const projectIds = await getUserProjectIds(userId);
  const now = new Date();
  const future = new Date();
  future.setDate(future.getDate() + days);

  const tasks = await Task.find({
    project: { $in: projectIds },
    status: { $ne: TaskStatus.DONE },
    dueDate: { $gte: now, $lte: future },
  })
    .sort({ dueDate: 1 })
    .limit(10)
    .populate("assignee", "name email");

  return tasks;
};

const getHighPriority = async (userId: Types.ObjectId | string) => {
  const projectIds = await getUserProjectIds(userId);

  const tasks = await Task.find({
    project: { $in: projectIds },
    priority: TaskPriority.HIGH,
    status: { $ne: TaskStatus.DONE },
  })
    .sort({ dueDate: 1 })
    .limit(10)
    .populate("assignee", "name email");

  return tasks;
};

const getCharts = async (userId: Types.ObjectId | string) => {
  const projectIds = await getUserProjectIds(userId);

  const [tasksByPriority, taskStatusDistribution, projectProgress] =
    await Promise.all([
      Task.aggregate([
        { $match: { project: { $in: projectIds } } },
        { $group: { _id: "$priority", count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { $match: { project: { $in: projectIds } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Promise.all(
        (await Project.find({ _id: { $in: projectIds } })).map(async (p) => {
          const total = await Task.countDocuments({ project: p._id });
          const completed = await Task.countDocuments({
            project: p._id,
            status: TaskStatus.DONE,
          });
          return {
            name: p.name,
            total,
            completed,
            percent: total > 0 ? Math.round((completed / total) * 100) : 0,
          };
        }),
      ),
    ]);

  return {
    tasksByPriority: tasksByPriority.map((r) => ({
      priority: r._id,
      count: r.count,
    })),
    taskStatusDistribution: taskStatusDistribution.map((r) => ({
      status: r._id,
      count: r.count,
    })),
    projectProgress,
  };
};

export const dashboardService = {
  getStats,
  getProjectSummaries,
  getWorkload,
  getUpcomingDeadlines,
  getHighPriority,
  getCharts,
};
