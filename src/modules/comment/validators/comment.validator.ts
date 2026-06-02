import { z } from "zod";

const createCommentSchema = z.object({
  body: z.object({
    text: z.string().min(1).max(1000),
  }),
});

export type TCreateCommentInput = z.infer<typeof createCommentSchema>["body"];

export const commentValidator = {
  createCommentSchema,
};
