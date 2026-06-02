import { ProjectStatus } from "../types/project.types";
import { z } from "zod";

const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    deadline: z.string().datetime().optional(),
    status: z.nativeEnum(ProjectStatus).optional(),
  }),
});

const updateProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    deadline: z.string().datetime().optional(),
    status: z.nativeEnum(ProjectStatus).optional(),
  }),
});

export type TCreateProjectInput = z.infer<typeof createProjectSchema>["body"];
export type TUpdateProjectInput = z.infer<typeof updateProjectSchema>["body"];

export const projectValidator = {
  createProjectSchema,
  updateProjectSchema,
};
