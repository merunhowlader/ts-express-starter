import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters'),

    email: z.string().trim().email('Invalid email address').toLowerCase(),

    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),
});

export const getUserByIdSchema = z.object({
  params: z.object({
    id: z.uuid('Invalid user ID.'),
  }),
});

export type CreateUserRequest = z.infer<typeof createUserSchema>;
