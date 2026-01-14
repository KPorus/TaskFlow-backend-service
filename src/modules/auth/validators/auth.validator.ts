import { z } from "zod";

// Register Validator
const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format from registerSchema"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    name: z.string(),
  }),
});

// Login Validator
const LoginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
  }),
});

const seedRegisterSchema = z.object({
  body: z.object({
    users: z.array(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string(),
      }),
    ),
  }),
});

export type TSeedRegisterInput = z.infer<
  typeof seedRegisterSchema
>["body"]["users"][number];
export type TLoginInput = z.infer<typeof LoginSchema>["body"];
export type TRegisterInput = z.infer<typeof registerSchema>["body"];

// Export Validators
export const authValidator = {
  registerSchema,
  LoginSchema,
  seedRegisterSchema,
};
