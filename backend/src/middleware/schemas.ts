import { z } from "zod";

export const registerSchema = z.object({
    body: z.object({
        name: z
            .string()
            .min(2, "Name must be at least 2 characters")
            .max(50, "Name must be at most 50 characters"),
        email: z.string().email("Invalid email format"),
        password: z
            .string()
            .min(6, "Password must be at least 6 characters")
            .max(100, "Password must be at most 100 characters"),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email format"),
        password: z.string().min(1, "Password is required"),
    }),
});

export const createBoardSchema = z.object({
    body: z.object({
        title: z
            .string()
            .min(1, "Title is required")
            .max(100, "Title must be at most 100 characters"),
        description: z
            .string()
            .max(500, "Description must be at most 500 characters")
            .optional()
            .default(""),
    }),
});

export const updateBoardSchema = z.object({
    body: z.object({
        title: z
            .string()
            .min(1, "Title is required")
            .max(100, "Title must be at most 100 characters")
            .optional(),
        description: z
            .string()
            .max(500, "Description must be at most 500 characters")
            .optional(),
    }),
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid board ID"),
    }),
});

export const createTaskSchema = z.object({
    body: z.object({
        title: z
            .string()
            .min(1, "Title is required")
            .max(200, "Title must be at most 200 characters"),
        description: z
            .string()
            .max(2000, "Description must be at most 2000 characters")
            .optional()
            .default(""),
        status: z.enum(["todo", "in-progress", "done"]).optional().default("todo"),
        priority: z.enum(["low", "med", "high"]).optional().default("med"),
        dueDate: z.string().datetime().optional().nullable(),
        estimatedEffort: z.string().optional().nullable(),
    }),
    params: z.object({
        boardId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid board ID"),
    }),
});

export const updateTaskSchema = z.object({
    body: z.object({
        title: z
            .string()
            .min(1, "Title is required")
            .max(200, "Title must be at most 200 characters")
            .optional(),
        description: z
            .string()
            .max(2000, "Description must be at most 2000 characters")
            .optional(),
        status: z.enum(["todo", "in-progress", "done"]).optional(),
        priority: z.enum(["low", "med", "high"]).optional(),
        dueDate: z.string().datetime().optional().nullable(),
        estimatedEffort: z.string().optional().nullable(),
    }),
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid task ID"),
    }),
});

export const moveTaskSchema = z.object({
    body: z.object({
        status: z.enum(["todo", "in-progress", "done"]),
    }),
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid task ID"),
    }),
});

export const aiSuggestSchema = z.object({
    body: z.object({
        title: z
            .string()
            .min(1, "Title is required")
            .max(200, "Title must be at most 200 characters"),
        description: z
            .string()
            .max(2000, "Description must be at most 2000 characters")
            .optional()
            .default(""),
    }),
});
