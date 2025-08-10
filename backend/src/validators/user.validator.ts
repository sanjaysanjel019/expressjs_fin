import { z } from "zod";

export const updateUserSchema = z.object({
    name: z.string().trim().min(1).max(256).optional(),
});

export type UpdateUserType = z.infer<typeof updateUserSchema>;