import { authenticateJWT } from "@/middlewares/auth.middleware";
import { teamRouter } from "./modules/team/routes/team.route";
import { taskRouter } from "./modules/task/routes/task.route";
import { internalRouter } from "./modules/auth/internal";
import { authRouter } from "./modules/auth/routes";
import { Router } from "express";

const router = Router();

const moduleRoutes = [
  {
    protected: false,
    path: "/auth",
    module: authRouter,
  },
  {
    protected: false,
    path: "/auth/internal",
    module: internalRouter,
  },
  {
    protected: true,
    path: "/team",
    module: teamRouter,
  },
  {
    protected: true,
    path: "/task",
    module: taskRouter,
  },
];

moduleRoutes.forEach((route) => {
  if (route.protected) {
    router.use(route.path, authenticateJWT, route.module);
  } else {
    router.use(route.path, route.module);
  }
});

export default router;
