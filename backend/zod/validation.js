import z from "zod";

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6, "Password must be at least 6 characters long"),

});

const registerSchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["admin", "member"]),
});

const projectCreateSchema = z.object({
    name: z.string().min(1, "Project name is required"),
    description: z.string().optional()
});

const projectMemberSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    role: z.enum(["admin", "member"]).optional()
});

const taskCreateSchema = z.object({
    title: z.string().min(1, "Task title is required"),
    description: z.string().optional(),
    dueDate: z.coerce.date().optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    projectId: z.string().min(1, "Project ID is required"),
    assignedTo: z.string().optional()
});

const taskUpdateSchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    dueDate: z.coerce.date().optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    status: z.enum(['todo', 'inprogress', 'done']).optional(),
    assignedTo: z.string().optional()
});

export {
    loginSchema,
    registerSchema,
    projectCreateSchema,
    projectMemberSchema,
    taskCreateSchema,
    taskUpdateSchema
}
