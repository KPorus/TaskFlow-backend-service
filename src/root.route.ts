import { notificationRouter } from "./modules/notification/routes/notification.route";
import { dashboardRouter } from "./modules/dashboard/routes/dashboard.route";
import { activityRouter } from "./modules/activity/routes/activity.route";
import { projectRouter } from "./modules/project/routes/project.route";
import { commentRouter } from "./modules/comment/routes/comment.route";
import { requireInternalAccess } from "@/helpers/internal-route.guard";
import { authenticateJWT } from "@/middlewares/auth.middleware";
import { taskRouter } from "./modules/task/routes/task.route";
import { internalRouter } from "./modules/auth/internal";
import { authRouter } from "./modules/auth/routes";
import { Router } from "express";

const router = Router();

const moduleRoutes = [
  { protected: false, path: "/auth", module: authRouter },
  { protected: true, path: "/project", module: projectRouter },
  { protected: true, path: "/task", module: taskRouter },
  { protected: true, path: "/activity", module: activityRouter },
  { protected: true, path: "/dashboard", module: dashboardRouter },
  { protected: true, path: "/comment", module: commentRouter },
  { protected: true, path: "/notification", module: notificationRouter },
];

moduleRoutes.forEach((route) => {
  if (route.protected) {
    router.use(route.path, authenticateJWT, route.module);
  } else {
    router.use(route.path, route.module);
  }
});

router.use("/auth/internal", requireInternalAccess, internalRouter);

export default router;
