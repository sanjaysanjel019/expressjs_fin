import { z } from "zod";

export const emailSchema = z
  .string()
  .email("Invalid Email Addrress")
  .min(1)
  .max(255);

export const passwordSchema = z
 .string()
 .min(4)
 .max(100);

export const registerSchema = z.object({
    name:z.string().trim().min(1).max(255),
    email:emailSchema,
    password:passwordSchema
});

export const loginSchema = z.object({
    email:emailSchema,
    password:passwordSchema
});

export type RegisterSchemaType = z.infer<typeof registerSchema>;
export type LoginSchemaType = z.infer<typeof loginSchema>;

