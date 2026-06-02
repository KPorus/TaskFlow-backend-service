import { TaskPriority, TaskStatus } from "../models/task.model";
import { z } from "zod";

const taskSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    assignee: z.string().optional(),
    dueDate: z.string().datetime().optional(),
  }),
});

const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    assignee: z.string().optional(),
    dueDate: z.string().datetime().optional(),
  }),
});

const taskListSchema = z.object({
  body: z.object({
    projectId: z.string(),
    search: z.string().optional(),
    status: z.array(z.nativeEnum(TaskStatus)).optional(),
    priority: z.array(z.nativeEnum(TaskPriority)).optional(),
    assignee: z.string().optional(),
    deadlineStatus: z.enum(["UPCOMING", "OVERDUE"]).optional(),
    sortBy: z
      .enum(["createdAt", "dueDate", "priority", "updatedAt"])
      .optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
  }),
});

export type TTaskInput = z.infer<typeof taskSchema>["body"];
export type TCreateTaskInput = z.infer<typeof createTaskSchema>["body"];
export type TTaskListInput = z.infer<typeof taskListSchema>["body"];

export const taskValidator = {
  taskSchema,
  createTaskSchema,
  taskListSchema,
};
