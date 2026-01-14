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

export type TTaskInput = z.infer<typeof taskSchema>["body"];

export const taskValidator = {
  taskSchema,
};
